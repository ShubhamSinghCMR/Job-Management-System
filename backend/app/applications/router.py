from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.constants import UserRole
from app.users.model import User
from app.applications.schema import (
    ApplicationResponse,
    ApplicationWithJobseekerResponse,
    ApplicationStatusUpdate,
)
from app.applications import service


router = APIRouter(prefix="/api/v1/applications", tags=["Applications"])


@router.post("/{job_id}", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only jobseekers can apply"
        )

    application, error = service.apply_to_job(
        job_id,
        current_user.id,
        db,
    )

    if error == "JOB_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if error == "ALREADY_APPLIED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already applied to this job"
        )

    return application


@router.get("/my", response_model=list[ApplicationResponse])
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only jobseekers can view their applications"
        )

    return service.get_my_applications(current_user.id, db)


@router.get("/job/{job_id}", response_model=list[ApplicationWithJobseekerResponse])
def job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can view applications"
        )

    applications = service.get_job_applications(job_id, db)
    result = []
    for app in applications:
        js = app.jobseeker
        result.append(ApplicationWithJobseekerResponse(
            id=app.id,
            job_id=app.job_id,
            jobseeker_id=app.jobseeker_id,
            status=app.status,
            applied_at=app.applied_at,
            jobseeker_name=js.name if js else "",
            jobseeker_email=js.email if js else "",
            jobseeker_skills=js.skills if js else None,
            jobseeker_location=js.location if js else None,
        ))
    return result


    return result


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update application status"
        )

    application, error = service.update_application_status(
        application_id,
        current_user.id,
        data.status,
        db,
    )

    if error == "NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if error == "FORBIDDEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this application"
        )

    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only jobseekers can withdraw their applications"
        )

    _, error = service.withdraw_application(
        application_id,
        current_user.id,
        db,
    )

    if error == "NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if error == "FORBIDDEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to withdraw this application"
        )

    return None