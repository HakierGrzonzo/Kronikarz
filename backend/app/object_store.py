from os import environ

from miniopy_async import Minio


def get_object_store() -> Minio:
    minio = Minio(
        environ.get("MINIO_HOSTNAME", "localhost:9000"),
        environ.get("MINIO_USER", "minioadmin"),
        environ.get("MINIO_PASSWORD", "minioadmin"),
        secure=False,
    )
    minio.set_app_info("kronikarz", "0.0.0")
    yield minio


async def init_minio_buckets():
    for minio in get_object_store():
        if not await minio.bucket_exists("kronikarz"):
            await minio.make_bucket("kronikarz")
