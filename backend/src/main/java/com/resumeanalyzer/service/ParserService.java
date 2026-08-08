package com.resumeanalyzer.service;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class ParserService {

    public String parseDocument(MultipartFile file) throws Exception {
        try (InputStream stream = file.getInputStream()) {
            AutoDetectParser parser = new AutoDetectParser();
            // -1 handler value removes character limits to parse long files fully
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            ParseContext context = new ParseContext();
            
            parser.parse(stream, handler, metadata, context);
            return handler.toString();
        }
    }
}
