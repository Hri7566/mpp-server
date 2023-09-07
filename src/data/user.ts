import { User } from "@prisma/client";
import { prisma } from "./prisma";

export interface UserFlags {
    freeze_name: number;
    "no chat rate limit": number;
    chat_curse_1: number;
    chat_curse_2: number;
    override_id: string;
}

export async function createUser(
    _id: string,
    name?: string,
    color?: string,
    flags?: UserFlags
) {
    return await prisma.user.create({
        data: { id: _id, name, color, flags: JSON.stringify(flags) }
    });
}

export async function deleteUser(_id: string) {
    return await prisma.user.delete({
        where: { id: _id }
    });
}

export async function readUser(_id: string) {
    const data = await prisma.user.findUnique({
        where: { id: _id }
    });

    if (!data) return null;

    return {
        _id: data.id,
        name: data.name,
        color: data.color,
        flags: data.flags
    };
}

export async function updateUser(
    _id: string,
    data: Omit<User, "id"> & { _id: string }
) {
    return await prisma.user.update({
        where: { id: _id },
        data
    });
}
