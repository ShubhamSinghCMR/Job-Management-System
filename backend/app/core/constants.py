from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    EMPLOYER = "employer"
    JOBSEEKER = "jobseeker"