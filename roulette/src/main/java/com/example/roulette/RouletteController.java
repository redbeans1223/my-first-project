package com.example.roulette;

import java.util.Random;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost3000", allowCredentials= "true")
public class RouletteController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello, Roulette!!";
    }
    @PostMapping(value = "/roulette", consumes="application/json")
    public ResponseEntity<RouletteResult> createRoulette(@RequestBody RouletteRequest request) {
        try {
            System.out.println("Received: " + request.getType() + ", " + 
                (request.getType() != null ? java.util.Arrays.toString(request.getSegments()) : "null") +
                ", start=" + request.getStart() + ", end=" + request.getEnd());
            Random random = new Random();
            String result;
            if ("text".equals(request.getType())) {
                String[] segments = request.getSegments();
                if ( segments == null || segments.length == 0) {
                    throw new IllegalArgumentException("Segments cannot be empty for text type");
                }
                result = segments[random.nextInt(segments.length)];
            } else if ("number".equals(request.getType())) {
                Integer start = request.getStart();
                Integer end = request.getEnd();
                if ( start == null || end == null || start > end) {
                    throw new IllegalArgumentException("Invalid: Start or End values");
                }
                result = String.valueOf(random.nextInt(end - start + 1) + start);
                
            } else {
                throw new IllegalArgumentException("Invalid type: " + request.getType());
            }
            return ResponseEntity.ok(new RouletteResult(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new RouletteResult("Error: " + e.getMessage()));
        }
        
    }
}    

class RouletteRequest {
    private String type;
    private String[] segments;
    private Integer start;
    private Integer end;

    public String getType(){ return type; }
    public void setType(String type) { this.type = type; }
    public String[] getSegments() { return segments; }
    public void setSegments(String[] segments) { this.segments = segments; }
    public Integer getStart() { return start; }
    public Integer getEnd() { return end; }
    public void setStart(Integer start) { this.start = start; }
    public void setEnd(Integer end) { this.end = end; }
}
    
class RouletteResult {
    private String result;
    public RouletteResult(String result) { this.result = result; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}
