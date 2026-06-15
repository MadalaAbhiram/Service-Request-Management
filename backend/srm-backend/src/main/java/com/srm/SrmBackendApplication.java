package com.srm;

import com.srm.mongo.MongoConnectionEvent;
import com.srm.mongo.MongoConnectionEventRepository;
import com.srm.model.User;
import com.srm.repository.UserRepository;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableAsync
public class SrmBackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(SrmBackendApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SrmBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner createAdmin(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        MongoConnectionEventRepository mongoConnectionEventRepository,
        MongoTemplate mongoTemplate
    ) {
        return args -> {
            String adminEmail = "Abhi@147";
            String adminPassword = "123";
            String adminName = "Admin";

            User admin = userRepository.findByEmail(adminEmail).orElseGet(User::new);
            admin.setName(adminName);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("admin");
            userRepository.save(admin);

            try {
                logger.info("Mongo database name: {}", mongoTemplate.getDb().getName());
                mongoConnectionEventRepository.save(
                    new MongoConnectionEvent("srm-backend", "connected", Instant.now())
                );
                logger.info("Mongo connection saved successfully.");
            } catch (Exception ex) {
                logger.error("Mongo connection failed:", ex);
            }

            System.out.println("Admin ready: " + adminEmail);
        };
    }
}
