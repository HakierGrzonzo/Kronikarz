import asyncio
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_users import FastAPIUsers

from app.users import UserRead

from .models import InputProps
from .surreal_orm import Session, get_db
from .tables import FieldSetTemplate


def get_field_set_router(fastapi_users: FastAPIUsers):
    router = APIRouter()

    @router.get("/my", response_model=List[FieldSetTemplate])
    async def get_my_fieldsets(
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        return (
            await session.User.select_deep(
                current_user.id, ("field_set_templates",)
            )
        ).field_set_templates

    @router.post("/create", response_model=FieldSetTemplate)
    async def create_field_set_template(
        fields: List[InputProps],
        name: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        res = await session.FieldSetTemplate.create(fields=fields, name=name)
        await session.User.patch(
            current_user.id,
            field_set_templates=[*current_user.field_set_templates, res.id],
        )
        await session.commit()
        return res

    @router.post("/delete")
    async def delete_field_set_template(
        field_set_id: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if field_set_id not in current_user.field_set_templates:
            raise HTTPException(404, "Field set not found!")

        await asyncio.gather(
            session.FieldSetTemplate.delete(field_set_id),
            session.User.patch(
                current_user.id,
                field_set_templates=filter(
                    lambda item: item != field_set_id,
                    current_user.field_set_templates,
                ),
            ),
        )
        await session.commit()

    return router
