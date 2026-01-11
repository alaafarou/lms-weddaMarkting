import {hash,compare} from "bcrypt"

export const GenerateHash = async ({
    plaintext,
    salt = Number(process.env.SALT)
}: {
    plaintext: string,
    salt?: number
}): Promise<string> => {
    return await hash(plaintext, salt)
}


export const CompareHash = async ({
    plaintext,
    HashedValue,
}: {
    plaintext: string,
    HashedValue: string
}): Promise<boolean> => {
    return await compare(plaintext, HashedValue)
}

