package com.tirfy.beats;

import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableScheduling
@SpringBootApplication
public class BeatsApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeatsApplication.class, args);
	}

}
