import { useHref } from "@remix-run/react";

export const randomAvatar = (id: string) => {
  const name = `av${Math.floor(Math.random() * 10)}.svg`;
  return `/avatars/${name}`;
};

export function useFileUrl() {
  const base = useHref("/file");
  return (fileId: string): string => {
    const searchParams = new URLSearchParams();
    searchParams.append("id", fileId);
    return `${base}?${searchParams.toString()}`;
  };
}

interface Width {
  width: number;
  height?: undefined;
}
interface Height {
  width?: undefined;
  height: number;
}

export type Size = Width | Height | (Width & Height);

export function useImageUrl() {
  const base = useHref("/image");
  return (fileId: string, size: Size): string => {
    const searchParams = new URLSearchParams();
    searchParams.append("id", fileId);
    size?.height && searchParams.append("height", size.height.toString());
    size?.width && searchParams.append("height", size.width.toString());
    return `${base}?${searchParams.toString()}`;
  };
}
