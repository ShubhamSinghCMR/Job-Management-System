from pydantic import BaseModel
from typing import List


class OverviewStatsResponse(BaseModel):
    total_users: int
    total_employers: int
    total_jobseekers: int
    total_jobs: int
    total_applications: int


class PeriodStatItem(BaseModel):
    period: str
    count: int


class PeriodStatsResponse(BaseModel):
    data: List[PeriodStatItem]