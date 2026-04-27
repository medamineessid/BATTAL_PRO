<?php

namespace App\Models;

use Exception;

class Job extends BaseModel
{
    protected string $table = 'jobs';

    /**
     * Create a new job
     */
    public function createJob(array $jobData): string
    {
        $required = ['company_id', 'title', 'description'];
        foreach ($required as $field) {
            if (!isset($jobData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $data = [
            'company_id' => $jobData['company_id'],
            'title' => $jobData['title'],
            'description' => $jobData['description'],
            'location' => $jobData['location'] ?? null,
            'job_type' => $jobData['job_type'] ?? null,
            'salary_min' => $jobData['salary_min'] ?? null,
            'salary_max' => $jobData['salary_max'] ?? null,
            'salary_currency' => $jobData['salary_currency'] ?? 'USD',
            'experience_level' => $jobData['experience_level'] ?? null,
            'remote' => $jobData['remote'] ?? false,
            'required_skills' => isset($jobData['required_skills']) ? '{' . implode(',', $jobData['required_skills']) . '}' : null,
            'benefits' => isset($jobData['benefits']) ? '{' . implode(',', $jobData['benefits']) . '}' : null,
            'status' => $jobData['status'] ?? 'active'
        ];

        return $this->create($data);
    }

    /**
     * Get jobs by company
     */
    public function getByCompany(string $companyId): array
    {
        return $this->findBy(['company_id' => $companyId]);
    }

    /**
     * Get active jobs
     */
    public function getActiveJobs(array $filters = []): array
    {
        $conditions = ['status' => 'active'];
        if (isset($filters['job_type'])) {
            $conditions['job_type'] = $filters['job_type'];
        }
        if (isset($filters['location'])) {
            $conditions['location'] = $filters['location'];
        }

        return $this->getAll($conditions, ['created_at DESC']);
    }

    /**
     * Search jobs
     */
    public function search(string $query): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status = 'active' 
                AND (title ILIKE ? OR description ILIKE ?)
                ORDER BY created_at DESC";
        
        $searchTerm = "%$query%";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get jobs matching filters
     */
    public function getMatching(array $filters): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE status = 'active'";
        $params = [];

        if (isset($filters['job_types']) && !empty($filters['job_types'])) {
            $placeholders = implode(',', array_fill(0, count($filters['job_types']), '?'));
            $sql .= " AND job_type IN ($placeholders)";
            $params = array_merge($params, $filters['job_types']);
        }

        if (isset($filters['salary_min'])) {
            $sql .= " AND salary_max >= ?";
            $params[] = $filters['salary_min'];
        }

        if (isset($filters['industries'])) {
            // This would need a join with companies table
            $sql .= " AND company_id IN (SELECT id FROM companies WHERE industry = ANY(?))";
            $params[] = '{' . implode(',', $filters['industries']) . '}';
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Close job posting
     */
    public function closeJob(string $jobId): bool
    {
        return $this->update($jobId, ['status' => 'closed']);
    }

    /**
     * Get job with company info
     */
    public function getJobWithCompany(string $jobId): ?array
    {
        $sql = "SELECT j.*, c.name as company_name, c.logo_url 
                FROM {$this->table} j
                LEFT JOIN companies c ON j.company_id = c.id
                WHERE j.id = ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$jobId]);

        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }
}
