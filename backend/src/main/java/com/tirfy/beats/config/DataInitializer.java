package com.tirfy.beats.config;

import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.repository.CheckpointRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeCheckpoints(
            CheckpointRepository checkpointRepository) {

        return args -> {

            addCheckpoint(
                    checkpointRepository,
                    1, 1,
                    "START",
                    "6:00 AM",
                    "Sri Jagannatha Swamy, Thirumazhisai, Chennai"
            );

            addCheckpoint(
                    checkpointRepository,
                    1, 2,
                    "Sri Bakthavatsala Perumal, Tirunindravur",
                    "9:30 AM",
                    "Tirunindravur"
            );

            addCheckpoint(
                    checkpointRepository,
                    1, 3,
                    "Sri Veera Anjaneya Swamy Temple, Kakalur",
                    "1:00 PM",
                    "Kakalur"
            );

            addCheckpoint(
                    checkpointRepository,
                    1, 4,
                    "Sri Vaidya Veeraraghava Swamy, Thiruvallur",
                    "5:00 PM",
                    "Thiruvallur"
            );

            addCheckpoint(
                    checkpointRepository,
                    1, 5,
                    "Sri Sairam Mahal, Pullarambakkam — Night Rest",
                    "7:00 PM–5:00 AM",
                    "Pullarambakkam"
            );

            // Day 2
            addCheckpoint(checkpointRepository, 2, 6,
                    "Sri Loka Bhagavathy Temple, Mylapore",
                    "8:00 AM", "Mylapore");

            addCheckpoint(checkpointRepository, 2, 7,
                    "Shri Pallikondeeswara Swamy, Suruttapalli",
                    "11:30 AM", "Suruttapalli");

            addCheckpoint(checkpointRepository, 2, 8,
                    "Suruttapalli Rest Point",
                    "11:30 AM–2:30 PM", "Suruttapalli");

            addCheckpoint(checkpointRepository, 2, 9,
                    "Nandanam",
                    "4:30 PM", "Nandanam");

            addCheckpoint(checkpointRepository, 2, 10,
                    "Sri Vedanarayana Swamy Temple, Nagalapuram",
                    "6:30 PM", "Nagalapuram");

            addCheckpoint(checkpointRepository, 2, 11,
                    "TRR Kalyana Mandapam, Nagalapuram — Night Rest",
                    "7:00 PM–5:00 AM", "Nagalapuram");

            // Day 3
            addCheckpoint(checkpointRepository, 3, 12,
                    "Pitchatur Shri Jalagandeshwar Temple, Pitchatur Bypass",
                    "6:30 AM", "Pitchatur Bypass");

            addCheckpoint(checkpointRepository, 3, 13,
                    "Sri Venkateswara Swamy Temple, Nindra Sugar Factory",
                    "7:30 AM", "Nindra Sugar Factory");

            addCheckpoint(checkpointRepository, 3, 14,
                    "Kailasa Kona Falls Bus Stop",
                    "10:30 AM", "Kailasa Kona");

            addCheckpoint(checkpointRepository, 3, 15,
                    "Padavetti Amman Temple",
                    "11:30 AM–3:30 PM", "Padavetti Amman Temple");

            addCheckpoint(checkpointRepository, 3, 16,
                    "Sri Kalyana Venkateswaraswamy, Narayanavanam",
                    "5:00 PM", "Narayanavanam");

            addCheckpoint(checkpointRepository, 3, 17,
                    "GDR Convention Hall, Puttur — Night Rest",
                    "7:00 PM–4:00 AM", "Puttur");

            // Day 4
            addCheckpoint(checkpointRepository, 4, 18,
                    "Sri Murugan Temple, Pittur Bypass",
                    "6:00 AM", "Pittur Bypass");

            addCheckpoint(checkpointRepository, 4, 19,
                    "Thaduku Junction",
                    "8:00 AM", "Thaduku Junction");

            addCheckpoint(checkpointRepository, 4, 20,
                    "Sri Prasanna Venkateswara Swamy, Appalayagunta",
                    "10:30 AM", "Appalayagunta");

            addCheckpoint(checkpointRepository, 4, 21,
                    "Appalayagunta Rest Point",
                    "11:00 AM–2:00 PM", "Appalayagunta");

            addCheckpoint(checkpointRepository, 4, 22,
                    "Padmavathy Thayar, Thiruchanur",
                    "5:00 PM", "Thiruchanur");

            addCheckpoint(checkpointRepository, 4, 23,
                    "Sudarshan Mahal, Thiruchanur — Night Rest",
                    "7:00 PM–7:30 AM", "Thiruchanur");

            // Day 5
            addCheckpoint(checkpointRepository, 5, 24,
                    "Sri Govindaraja Swami Temple",
                    "9:00 AM", "Tirupati");

            addCheckpoint(checkpointRepository, 5, 25,
                    "Kapila Theertham",
                    "10:00 AM", "Tirupati");

            addCheckpoint(checkpointRepository, 5, 26,
                    "Divya Darshan Ticket Booking, Bhudevi Complex, Alipiri",
                    "12:00 PM", "Alipiri");

            addCheckpoint(checkpointRepository, 5, 27,
                    "Cherlopalli X Road",
                    "4:00 PM", "Cherlopalli");

            addCheckpoint(checkpointRepository, 5, 28,
                    "Srinivasa Mangapuram Kalyana Venkateswara Swamy",
                    "5:00 PM", "Srinivasa Mangapuram");

            addCheckpoint(checkpointRepository, 5, 29,
                    "Arya Vysya Kalyana Mandapam — Night Rest",
                    "6:00 PM–6:00 AM", "Tirupati");

            // Day 6
            addCheckpoint(checkpointRepository, 6, 30,
                    "Sri Anjaneya Swamy Temple, Near Srivari Mettu",
                    "7:30 AM", "Near Srivari Mettu");

            addCheckpoint(checkpointRepository, 6, 31,
                    "Srivari Mettu",
                    "9:00 AM", "Srivari Mettu");

            addCheckpoint(checkpointRepository, 6, 32,
                    "Tirumala",
                    "12:00 PM", "Tirumala");

            addCheckpoint(checkpointRepository, 6, 33,
                    "Tonsure / Sacred Water Bath @ Varaha Theertham",
                    "2:00 PM", "Varaha Theertham");

            addCheckpoint(checkpointRepository, 6, 34,
                    "Thirumala Thirupathi Sri Venkateswara Swamy Temple",
                    "4:00 PM", "Tirumala");
        };
    }
    private void addCheckpoint(
            CheckpointRepository repository,
            int dayNumber,
            int sequenceNumber,
            String name,
            String scheduledTime,
            String location) {

        if (!repository.existsByDayNumberAndSequenceNumber(
                dayNumber, sequenceNumber)) {

            Checkpoint checkpoint = new Checkpoint();
            checkpoint.setDayNumber(dayNumber);
            checkpoint.setSequenceNumber(sequenceNumber);
            checkpoint.setName(name);
            checkpoint.setScheduledTime(scheduledTime);
            checkpoint.setLocation(location);
            checkpoint.setIsActive(true);

            repository.save(checkpoint);
        }
    }
}