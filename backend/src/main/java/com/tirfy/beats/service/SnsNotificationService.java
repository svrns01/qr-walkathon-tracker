package com.tirfy.beats.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.util.List;

@Service
public class SnsNotificationService {

    private final SnsClient snsClient;
    private final String topicArn;

    public SnsNotificationService(
            @Value("${aws.sns.topic-arn}") String topicArn) {

        this.topicArn = topicArn;

        this.snsClient = SnsClient.builder()
                .region(Region.US_EAST_1)
                .build();
    }

    public void publishCheckpointScanSummary(
            List<String> scans,
            String windowStart,
            String windowEnd) {

        if (scans == null || scans.isEmpty()) {
            return;
        }

        String subject = "BEATS - Checkpoint Scan Summary";

        StringBuilder message = new StringBuilder();

        message.append("BEATS Checkpoint Scan Summary\n\n");
        message.append("Time window: ")
                .append(windowStart)
                .append(" - ")
                .append(windowEnd)
                .append("\n\n");

        message.append("Total scans: ")
                .append(scans.size())
                .append("\n\n");

        message.append("Scans:\n");
        message.append("----------------------------------------\n");

        for (String scan : scans) {
            message.append(scan).append("\n");
        }

        PublishRequest request = PublishRequest.builder()
                .topicArn(topicArn)
                .subject(subject)
                .message(message.toString())
                .build();

        snsClient.publish(request);
    }
}