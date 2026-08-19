package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.model.Analysis;
import com.resumeanalyzer.model.InterviewSession;
import com.resumeanalyzer.model.GithubAnalysis;
import com.resumeanalyzer.model.JobMatch;
import com.resumeanalyzer.dto.CourseRecommendationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.resumeanalyzer.model.TrainingResume;
import com.resumeanalyzer.repository.TrainingResumeRepository;

import java.util.*;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.api-url}")
    private String apiUrl;

    @Autowired
    private TrainingResumeRepository trainingResumeRepository;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ──────────────────────────────────────────────────────────────
    // API Key Validation
    // ──────────────────────────────────────────────────────────────

    private void requireApiKey() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException(
                "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable " +
                "before starting the application."
            );
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Resume Validation
    // ──────────────────────────────────────────────────────────────

    /**
     * Uses Gemini to verify whether the uploaded document is a valid resume or CV.
     * Returns true if it appears to be a resume, false otherwise.
     */
    public boolean isResume(String documentText) {
        requireApiKey();

        // Limit to first 3000 characters to keep the prompt lean
        String excerpt = documentText.length() > 3000 ? documentText.substring(0, 3000) : documentText;

        String prompt = "You are a document classifier. Determine if the following document is a resume or CV.\n\n" +
                "DOCUMENT TEXT:\n" + excerpt + "\n\n" +
                "Answer with ONLY a JSON object: { \"isResume\": true } or { \"isResume\": false }";

        try {
            String rawResponse = callGemini(prompt);
            JsonNode root = objectMapper.readTree(rawResponse);
            String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());
            JsonNode responseJson = objectMapper.readTree(jsonText);
            return responseJson.path("isResume").asBoolean(true);
        } catch (Exception e) {
            log.warn("Could not classify document via Gemini, assuming it is a resume. Error: {}", e.getMessage());
            // Default to allowing the upload if classification fails
            return true;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Resume Analysis
    // ──────────────────────────────────────────────────────────────

    public Analysis analyzeResume(String resumeText, String jobDescription) throws Exception {
        requireApiKey();
        String prompt = buildResumePrompt(resumeText, jobDescription);
        String rawResponse = callGemini(prompt);
        return parseGeminiResponse(rawResponse);
    }

    private String buildResumePrompt(String resumeText, String jobDescription) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are an expert Applicant Tracking System (ATS) reviewer and technical recruiter. ");
        promptBuilder.append("Evaluate the following resume text against the target job description.\n\n");

        List<TrainingResume> trainingResumes = trainingResumeRepository.findAll();
        if (!trainingResumes.isEmpty()) {
            promptBuilder.append("--- EXAMPLES OF HIGH QUALITY / TARGET RESUMES (FOR CONTEXT) ---\n");
            for (int i = 0; i < trainingResumes.size(); i++) {
                promptBuilder.append("Example ").append(i + 1).append(":\n");
                promptBuilder.append(trainingResumes.get(i).getExtractedText()).append("\n\n");
            }
            promptBuilder.append("--- END OF EXAMPLES ---\n\n");
            promptBuilder.append("Using the above examples as a standard for quality, formatting, and expectations, evaluate the following candidate.\n\n");
        }

        promptBuilder.append("JOB DESCRIPTION:\n").append(jobDescription).append("\n\n");
        promptBuilder.append("RESUME TEXT:\n").append(resumeText).append("\n\n");
        
        promptBuilder.append("Calculate the ATS Score strictly out of 100 using this grading rubric breakdown:\n");
        promptBuilder.append("1. Keyword Match (0-30 points): The proportion of required programming languages, libraries, frameworks, and tools present in the resume.\n");
        promptBuilder.append("2. Experience Alignment (0-30 points): The relevance of the candidate's responsibilities, achievements, and projects to the job duties.\n");
        promptBuilder.append("3. Seniority & Scope Match (0-20 points): The alignment of years of experience, leadership scope, and architectural complexity.\n");
        promptBuilder.append("4. Education & Certifications (0-20 points): Matching the academic degrees, professional credentials, and location constraints.\n");
        promptBuilder.append("Sum these four sections to determine the final overall integer ATS Score.\n\n");
        promptBuilder.append("Provide:\n");
        promptBuilder.append("1. The calculated overall ATS Score (integer, 0-100).\n");
        promptBuilder.append("2. A list of missing skills (tools, platforms, programming languages, or concepts in the job description that are missing or weak in the resume).\n");
        promptBuilder.append("3. Improvement suggestions: Specific suggestions grouped by resume section. For each suggestion, provide: ");
        promptBuilder.append("the section name, the exact current text to replace (or empty if it is a new addition), ");
        promptBuilder.append("the suggested revision (must be specific, quantitative, and action-verb oriented), ");
        promptBuilder.append("the impact level ('High', 'Medium', or 'Low'), and the reason explaining why this revision raises the ATS score.\n\n");
        promptBuilder.append("You MUST return strictly a JSON object matching this schema. Do not include markdown wraps or backticks outside of the raw JSON content:\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"atsScore\": 85,\n");
        promptBuilder.append("  \"missingSkills\": [\"skill1\", \"skill2\"],\n");
        promptBuilder.append("  \"improvementSuggestions\": [\n");
        promptBuilder.append("    {\n");
        promptBuilder.append("      \"section\": \"Experience\",\n");
        promptBuilder.append("      \"currentText\": \"Worked on database queries\",\n");
        promptBuilder.append("      \"suggestedText\": \"Optimized 50+ complex PostgreSQL queries, reducing latency by 40% using indexing and partitioning\",\n");
        promptBuilder.append("      \"impact\": \"High\",\n");
        promptBuilder.append("      \"reason\": \"Adds quantitative impact and demonstrates deep SQL expertise which is highly requested\"\n");
        promptBuilder.append("    }\n");
        promptBuilder.append("  ]\n");
        promptBuilder.append("}");
        
        return promptBuilder.toString();
    }

    // ──────────────────────────────────────────────────────────────
    // Interview Questions
    // ──────────────────────────────────────────────────────────────

    public List<InterviewSession.Question> generateInterviewQuestions(String resumeText, String jobDescription) {
        requireApiKey();

        String prompt = "You are an expert technical interviewer. Analyze this applicant's resume relative to the job description.\n\n" +
                "JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                "RESUME TEXT:\n" + resumeText + "\n\n" +
                "Generate exactly 5 targeted interview questions.\n" +
                "Ensure:\n" +
                "1. The first 3 questions must be general technical or behavioral questions specific to the matched technologies.\n" +
                "2. The last 2 questions (questions 4 and 5) must be coding challenges, algorithm exercises, or programming tasks related to that stack.\n" +
                "3. Each question must have a category ('Technical' or 'Behavioral') and a difficulty ('Easy', 'Medium', or 'Hard').\n\n" +
                "You MUST respond strictly with a JSON array matching this schema:\n" +
                "[\n" +
                "  {\n" +
                "    " + "\"questionText\": \"Coding Task: Write a Java method that reverses a string in place.\",\n" +
                "    " + "\"category\": \"Technical\",\n" +
                "    " + "\"difficulty\": \"Medium\"\n" +
                "  }\n" +
                "]";

        try {
            String rawResponse = callGemini(prompt);
            return parseQuestionsResponse(rawResponse);
        } catch (Exception e) {
            log.error("Failed to generate questions from Gemini.", e);
            throw new RuntimeException("Failed to generate interview questions: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Answer Evaluation
    // ──────────────────────────────────────────────────────────────

    public InterviewSession.Answer evaluateInterviewAnswer(String questionText, String userAnswerText) {
        requireApiKey();

        String prompt = "You are an expert interviewer. Review this interview question and the candidate's response.\n\n" +
                "QUESTION:\n" + questionText + "\n\n" +
                "CANDIDATE RESPONSE:\n" + userAnswerText + "\n\n" +
                "Provide:\n" +
                "1. An AI score (integer, 0-100) indicating how correct, complete, and professional the response is.\n" +
                "2. Constructive, detailed feedback explaining what was good, what was missing, and how they can improve.\n" +
                "3. A list of 3-5 ideal keywords or technical concepts they should have mentioned.\n\n" +
                "You MUST respond strictly with a JSON object matching this schema:\n" +
                "{\n" +
                "  \"score\": 80,\n" +
                "  \"feedback\": \"Your explanation of state management is good, but you should mention Redux Toolkit...\",\n" +
                "  \"idealKeywords\": [\"Redux Toolkit\", \"Context API\", \"actions\", \"reducers\"]\n" +
                "}";

        try {
            String rawResponse = callGemini(prompt);
            return parseAnswerResponse(rawResponse);
        } catch (Exception e) {
            log.error("Failed to evaluate answer using Gemini.", e);
            throw new RuntimeException("Failed to evaluate answer: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Course Recommendations
    // ──────────────────────────────────────────────────────────────

    public List<CourseRecommendationResponse> generateCourseRecommendations(List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return new ArrayList<>();
        }

        requireApiKey();

        String prompt = "You are an expert training consultant. Review this list of missing skills:\n" +
                String.join(", ", missingSkills) + "\n\n" +
                "For each missing skill, suggest exactly 2 highly rated online courses.\n" +
                "Ensure:\n" +
                "1. Suggest one course from Coursera, and one from Udemy or edX.\n" +
                "2. Provide: the skill name, course title, platform provider, course search URL, and difficulty ('Beginner', 'Intermediate', 'Advanced').\n\n" +
                "You MUST respond strictly with a JSON array matching this schema:\n" +
                "[\n" +
                "  {\n" +
                "    \"skill\": \"React\",\n" +
                "    \"courses\": [\n" +
                "      {\n" +
                "        \"title\": \"React - The Complete Guide (incl Hooks, React Router, Redux)\",\n" +
                "        \"provider\": \"Udemy\",\n" +
                "        \"url\": \"https://www.udemy.com/courses/search/?q=react\",\n" +
                "        \"difficulty\": \"Beginner\"\n" +
                "      }\n" +
                "    ]\n" +
                "  }\n" +
                "]";

        try {
            String rawResponse = callGemini(prompt);
            return parseCourseRecommendations(rawResponse);
        } catch (Exception e) {
            log.error("Failed to generate course recommendations from Gemini.", e);
            throw new RuntimeException("Failed to generate course recommendations: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Text Enhancement
    // ──────────────────────────────────────────────────────────────

    public String enhanceResumeText(String text, String context) {
        requireApiKey();

        String prompt = "You are an expert resume writer and technical copywriter.\n" +
                "Enhance the following text to make it extremely professional, action-oriented, and metrics-driven.\n" +
                "Use strong action verbs, quantify achievements if applicable, and maintain a concise professional tone.\n\n" +
                "CONTEXT:\n" + context + "\n\n" +
                "ORIGINAL TEXT:\n" + text + "\n\n" +
                "You MUST respond strictly with a JSON object matching this schema:\n" +
                "{\n" +
                "  \"enhancedText\": \"Enhanced professional text goes here\"\n" +
                "}";

        try {
            String rawResponse = callGemini(prompt);
            JsonNode root = objectMapper.readTree(rawResponse);
            String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());
            JsonNode responseJson = objectMapper.readTree(jsonText);
            return responseJson.path("enhancedText").asText(text);
        } catch (Exception e) {
            log.error("Failed to enhance text using Gemini.", e);
            throw new RuntimeException("Failed to enhance text: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Cover Letter
    // ──────────────────────────────────────────────────────────────

    public String generateCoverLetter(String resumeText, String jobDescription, String recipientName, String companyName, String jobTitle) {
        requireApiKey();

        String prompt = "You are an expert career consultant and professional resume/cover letter writer.\n" +
                "Write a highly professional, tailored, and persuasive cover letter based on the candidate's resume and target job description.\n\n" +
                "TARGET RECIPIENT:\n" + recipientName + "\n" +
                "TARGET COMPANY:\n" + companyName + "\n" +
                "TARGET ROLE:\n" + jobTitle + "\n\n" +
                "JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                "CANDIDATE RESUME TEXT:\n" + resumeText + "\n\n" +
                "Ensure the letter has: a professional header format, clear salutation, compelling introduction, 2 body paragraphs highlighting key technical achievements and skill alignments matching the job description, and a strong conclusion with call to action and professional signature.\n\n" +
                "You MUST respond strictly with a JSON object matching this schema. Do not include markdown wraps or backticks outside of the raw JSON content:\n" +
                "{\n" +
                "  \"coverLetterContent\": \"[Date]\\n\\n[Recipient Name]\\n[Company Name]\\n\\nDear [Recipient Name],\\n\\nI am writing to express my strong interest in...\"\n" +
                "}";

        try {
            String rawResponse = callGemini(prompt);
            JsonNode root = objectMapper.readTree(rawResponse);
            String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());
            JsonNode responseJson = objectMapper.readTree(jsonText);
            return responseJson.path("coverLetterContent").asText("");
        } catch (Exception e) {
            log.error("Failed to generate cover letter using Gemini.", e);
            throw new RuntimeException("Failed to generate cover letter: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // GitHub Profile Evaluation
    // ──────────────────────────────────────────────────────────────

    public GithubAnalysis evaluateGithubProfile(String username, Map<String, Object> stats, String readmeContent) {
        requireApiKey();

        String prompt = "You are an expert technical recruiter and open-source evaluator.\n" +
                "Evaluate this candidate's GitHub Profile statistics and personal README file details.\n\n" +
                "GITHUB STATS:\n" + stats.toString() + "\n\n" +
                "PERSONAL README CONTENT:\n" + readmeContent + "\n\n" +
                "Generate:\n" +
                "1. A GitHub Score (integer, 0-100) representing their technical skills, open-source documentation quality, and repository activity.\n" +
                "2. A README Quality score assessment: 'High', 'Medium', or 'Low'.\n" +
                "3. A list of 2-3 technical strengths (such as diverse tech stack, good project layout, popular repos).\n" +
                "4. A list of 2-3 weaknesses or areas of improvement.\n" +
                "5. Exactly 3 recommended software projects they should build next to significantly improve their employability, specifying project title, detailed description, difficulty, and ideal tech stack.\n\n" +
                "You MUST respond strictly with a JSON object matching this schema. Do not include markdown wraps or backticks outside of the raw JSON content:\n" +
                "{\n" +
                "  \"githubScore\": 82,\n" +
                "  \"readmeQuality\": \"High\",\n" +
                "  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n" +
                "  \"weaknesses\": [\"Weakness 1\", \"Weakness 2\"],\n" +
                "  \"suggestedProjects\": [\n" +
                "    {\n" +
                "      \"title\": \"Distributed Task Queue\",\n" +
                "      \"description\": \"Build a task scheduler using Redis and Spring Boot with failure retries...\",\n" +
                "      \"difficulty\": \"Hard\",\n" +
                "      \"technologies\": \"Java, Spring Boot, Redis\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        try {
            String rawResponse = callGemini(prompt);
            JsonNode root = objectMapper.readTree(rawResponse);
            String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());
            JsonNode responseJson = objectMapper.readTree(jsonText);

            GithubAnalysis analysis = new GithubAnalysis();
            analysis.setGithubScore(responseJson.path("githubScore").asInt(75));
            analysis.setReadmeQuality(responseJson.path("readmeQuality").asText("Medium"));

            List<String> strengths = new ArrayList<>();
            responseJson.path("strengths").forEach(n -> strengths.add(n.asText()));
            analysis.setStrengths(strengths);

            List<String> weaknesses = new ArrayList<>();
            responseJson.path("weaknesses").forEach(n -> weaknesses.add(n.asText()));
            analysis.setWeaknesses(weaknesses);

            List<GithubAnalysis.ProjectRecommendation> suggestedProjects = new ArrayList<>();
            responseJson.path("suggestedProjects").forEach(n -> {
                suggestedProjects.add(new GithubAnalysis.ProjectRecommendation(
                        n.path("title").asText("New Project"),
                        n.path("description").asText("Project description"),
                        n.path("difficulty").asText("Medium"),
                        n.path("technologies").asText("Java, Spring Boot")
                ));
            });
            analysis.setSuggestedProjects(suggestedProjects);

            return analysis;
        } catch (Exception e) {
            log.error("Failed to run Gemini GitHub analysis.", e);
            throw new RuntimeException("Failed to evaluate GitHub profile: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Job Match
    // ──────────────────────────────────────────────────────────────

    public JobMatch evaluateJobMatch(String resumeText, String jobDescription) {
        requireApiKey();

        String prompt = "You are an expert AI recruiting matchmaker.\n" +
                "Evaluate this candidate's resume relative to the target job description requirements.\n\n" +
                "JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                "RESUME TEXT:\n" + resumeText + "\n\n" +
                "Generate:\n" +
                "1. A compatibility score (integer, 0-100) indicating how well the candidate's skills and experience match the role.\n" +
                "2. A list of key matched skills (technologies, languages, or concepts present in both the resume and the job description).\n" +
                "3. A list of critical missing skills (requirements in the job description that are missing from the resume).\n\n" +
                "You MUST respond strictly with a JSON object matching this schema. Do not include markdown wraps or backticks outside of the raw JSON content:\n" +
                "{\n" +
                "  \"compatibilityScore\": 84,\n" +
                "  \"matchedSkills\": [\"Java\", \"Spring Boot\", \"MongoDB\"],\n" +
                "  \"missingSkills\": [\"Kubernetes\", \"CI/CD\", \"Kafka\"]\n" +
                "}";

        try {
            String rawResponse = callGemini(prompt);
            JsonNode root = objectMapper.readTree(rawResponse);
            String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());
            JsonNode responseJson = objectMapper.readTree(jsonText);

            JobMatch match = new JobMatch();
            match.setCompatibilityScore(responseJson.path("compatibilityScore").asInt(70));

            List<String> matched = new ArrayList<>();
            responseJson.path("matchedSkills").forEach(n -> matched.add(n.asText()));
            match.setMatchedSkills(matched);

            List<String> missing = new ArrayList<>();
            responseJson.path("missingSkills").forEach(n -> missing.add(n.asText()));
            match.setMissingSkills(missing);

            return match;
        } catch (Exception e) {
            log.error("Failed to run Gemini Job Match analysis.", e);
            throw new RuntimeException("Failed to evaluate job match: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Core Gemini HTTP Call
    // ──────────────────────────────────────────────────────────────

    private String callGemini(String prompt) throws Exception {
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        List<Map<String, Object>> partsList = new ArrayList<>();
        partsList.add(textPart);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", partsList);

        List<Map<String, Object>> contentsList = new ArrayList<>();
        contentsList.add(contentMap);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", contentsList);
        payload.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        String fullUrl = apiUrl + "?key=" + apiKey;

        return restTemplate.postForObject(fullUrl, request, String.class);
    }

    // ──────────────────────────────────────────────────────────────
    // Response Parsers
    // ──────────────────────────────────────────────────────────────

    private String cleanJsonText(String rawText) {
        if (rawText.startsWith("```json")) {
            rawText = rawText.substring(7);
        }
        if (rawText.endsWith("```")) {
            rawText = rawText.substring(0, rawText.length() - 3);
        }
        return rawText.trim();
    }

    private Analysis parseGeminiResponse(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());

        JsonNode responseJson = objectMapper.readTree(jsonText);
        int atsScore = responseJson.path("atsScore").asInt(60);

        List<String> missingSkills = new ArrayList<>();
        responseJson.path("missingSkills").forEach(node -> missingSkills.add(node.asText()));

        List<Analysis.ImprovementSuggestion> suggestions = new ArrayList<>();
        responseJson.path("improvementSuggestions").forEach(node -> {
            suggestions.add(new Analysis.ImprovementSuggestion(
                    node.path("section").asText("General"),
                    node.path("currentText").asText(""),
                    node.path("suggestedText").asText(""),
                    node.path("impact").asText("Medium"),
                    node.path("reason").asText("")
            ));
        });

        Analysis analysis = new Analysis();
        analysis.setAtsScore(atsScore);
        analysis.setMissingSkills(missingSkills);
        analysis.setImprovementSuggestions(suggestions);
        return analysis;
    }

    private List<InterviewSession.Question> parseQuestionsResponse(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());

        JsonNode questionsJson = objectMapper.readTree(jsonText);
        List<InterviewSession.Question> questions = new ArrayList<>();

        questionsJson.forEach(node -> {
            questions.add(new InterviewSession.Question(
                    UUID.randomUUID().toString(),
                    node.path("questionText").asText("No question text generated"),
                    node.path("category").asText("Technical"),
                    node.path("difficulty").asText("Medium")
            ));
        });

        return questions;
    }

    private InterviewSession.Answer parseAnswerResponse(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());

        JsonNode answerJson = objectMapper.readTree(jsonText);
        int score = answerJson.path("score").asInt(70);
        String feedback = answerJson.path("feedback").asText("Response evaluated successfully.");

        List<String> idealKeywords = new ArrayList<>();
        answerJson.path("idealKeywords").forEach(node -> idealKeywords.add(node.asText()));

        InterviewSession.Answer answer = new InterviewSession.Answer();
        answer.setAiScore(score);
        answer.setAiFeedback(feedback);
        answer.setIdealKeywords(idealKeywords);
        return answer;
    }

    private List<CourseRecommendationResponse> parseCourseRecommendations(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        String jsonText = cleanJsonText(root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText());

        JsonNode recommendationsJson = objectMapper.readTree(jsonText);
        List<CourseRecommendationResponse> recommendations = new ArrayList<>();

        recommendationsJson.forEach(node -> {
            String skill = node.path("skill").asText("");
            List<CourseRecommendationResponse.Course> courses = new ArrayList<>();

            node.path("courses").forEach(cNode -> {
                courses.add(new CourseRecommendationResponse.Course(
                        cNode.path("title").asText("Online Course"),
                        cNode.path("provider").asText("E-Learning"),
                        cNode.path("url").asText("https://www.google.com/search?q=" + skill + "+course"),
                        cNode.path("difficulty").asText("Intermediate")
                ));
            });

            recommendations.add(new CourseRecommendationResponse(skill, courses));
        });

        return recommendations;
    }
}
