package com.joblens.aggregator.specification;

import com.joblens.aggregator.model.Job;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class JobSpecification {

    private JobSpecification() {}

    public static Specification<Job> withFilters(
            String what,
            String where,
            String company,
            Integer datePostedDays,
            String jobLevel,
            String workMode) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (what != null && !what.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + what.trim().toLowerCase() + "%"));
            }

            if (where != null && !where.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("location")),
                        "%" + where.trim().toLowerCase() + "%"));
            }

            if (company != null && !company.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("company")),
                        "%" + company.trim().toLowerCase() + "%"));
            }

            if (datePostedDays != null && datePostedDays > 0) {
                LocalDateTime cutoff = LocalDateTime.now().minusDays(datePostedDays);
                predicates.add(cb.greaterThanOrEqualTo(root.get("postedDate"), cutoff));
            }

            if (jobLevel != null && !jobLevel.isBlank()) {
                predicates.add(cb.equal(root.get("jobLevel"), jobLevel));
            }

            if (workMode != null && !workMode.isBlank()) {
                predicates.add(cb.equal(root.get("workMode"), workMode));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
