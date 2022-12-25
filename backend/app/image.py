from tempfile import TemporaryFile
from typing import Optional

from wand.image import Image

FORMAT_DICT = {
    "image/webp": "webp",
    "image/jpeg": "jpeg",
}


def resize_image(
    original_width: int,
    original_height: int,
    target_width: Optional[int],
    target_height: Optional[int],
) -> [int, int]:
    if target_height and target_width:
        return target_width, target_height

    if target_height:
        scale_factor = target_height / original_height
        return round(original_width * scale_factor), target_height
    else:
        scale_factor = target_width / original_width
        return target_width, round(original_height * scale_factor)


async def convert_file(
    file, width: Optional[int], height: Optional[int], target_content_type: str
):
    img = Image(blob=await file.read())
    if orientation := img.metadata.get("exif:Orientation"):
        orientation = int(orientation)
        # https://sirv.com/help/articles/rotate-photos-to-be-upright/
        # maps mirrored rotations to normal ones
        mirrored_dict = {2: 1, 4: 3, 5: 6, 7: 8}
        rotation_dict = {1: 0, 3: 180, 6: 90, 8: 270}
        # try to get rotation
        rotation = rotation_dict[mirrored_dict.get(orientation, orientation)]
        if rotation != 0:
            # Only rotate if we need to
            img.rotate(rotation)
        if orientation in mirrored_dict.keys():
            img.flop()

    width, height = resize_image(img.width, img.height, width, height)
    img.resize(width, height)
    img_converted = img.convert(FORMAT_DICT[target_content_type])

    tempfile = TemporaryFile("w+b")
    img_converted.save(tempfile)

    tempfile.seek(0)
    return tempfile
