from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.constants import UserRole
from app.users.model import User
from app.jobs.schema import (
    JobCreateRequest,
    JobUpdateRequest,
    JobResponse,
    JobDetailResponse,
    EmployerStatsResponse,
)
from app.jobs import service


router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])


@router.post(
    "/",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    data: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create jobs"
        )

    return service.create_job(current_user.id, data, db)


@router.get("/", response_model=list[JobDetailResponse])
def list_all_jobs(db: Session = Depends(get_db)):
    jobs = service.get_all_jobs(db)
    return [
        JobDetailResponse(
            id=j.id,
            title=j.title,
            description=j.description,
            location=j.location,
            employer_id=j.employer_id,
            created_at=j.created_at,
            company=j.employer.company if j.employer else None,
        )
        for j in jobs
    ]


@router.get("/my", response_model=list[JobResponse])
def list_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can view their jobs"
        )

    return service.get_employer_jobs(current_user.id, db)


@router.get("/my/stats", response_model=EmployerStatsResponse)
def list_my_jobs_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can view dashboard stats"
        )

    total_jobs, total_applications, hot_jobs = service.get_employer_stats(
        current_user.id, db
    )
    return EmployerStatsResponse(
        total_jobs=total_jobs,
        total_applications=total_applications,
        hot_jobs=hot_jobs,
    )


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    company = job.employer.company if job.employer else None
    return JobDetailResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        location=job.location,
        employer_id=job.employer_id,
        created_at=job.created_at,
        company=company,
    )


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    data: JobUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update jobs"
        )

    job, error = service.update_job(
        job_id,
        current_user.id,
        data,
        db,
    )

    if error == "JOB_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if error == "NOT_OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to modify this job"
        )

    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can delete jobs"
        )

    error = service.delete_job(
        job_id,
        current_user.id,
        db,
    )

    if error == "JOB_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if error == "NOT_OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this job"
        )

    return None