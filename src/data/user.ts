import { User } from "@prisma/client";
import { prisma } from "./prisma";
import { Tag, UserFlags } from "../util/types";
import { config } from "../ws/usersConfig";

export async function createUser(
    _id: string,
    name?: string,
    color?: string,
    flags?: UserFlags,
    tag?: Tag
) {
    try {
        return await prisma.user.create({
            data: {
                id: _id,
                name,
                color,
                flags: JSON.stringify(flags) || "",
                tag: JSON.stringify(tag) || ""
            }
        });
    } catch (err) {
        return {
            id: _id,
            name,
            color,
            flags: config.defaultFlags,
            tag: {}
        } as User;
    }
}

export async function getUsers() {
    return {
        users: await prisma.user.findMany(),
        count: await prisma.user.count()
    }
}

export async function deleteUser(_id: string) {
    return await prisma.user.delete({
        where: { id: _id }
    });
}

export async function readUser(_id: string) {
    try {
        const data = await prisma.user.findUnique({
            where: { id: _id }
        });

        if (!data) return null;

        // return {
        //     _id: data.id,
        //     name: data.name,
        //     color: data.color,
        //     flags: data.flags
        // };

        return data;
    } catch (err) {
        return createUser(_id);
    }
}

export async function updateUser(
    _id: string,
    data: Partial<Omit<User, "id"> & { _id: string }>
) {
    return await prisma.user.update({
        where: { id: _id },
        data
    });
}
