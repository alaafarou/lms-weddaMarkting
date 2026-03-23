import { verify, sign } from "jsonwebtoken"
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken"
import { roleEnum, UserHydratedDocument, UserModel } from "../../../Schema/UserModel"
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, NotFoundException, UnauthorizedException } from "../response/ErrorResponse";
import { TokenRepositry } from "../DatabasePattern/TokenRepostory";
import { UserRepositry } from "../DatabasePattern/UserRepositry";
import { Types } from "mongoose";
import type { Request } from "express";
import { TokenModel } from "../../../Schema/TokenModel";

export enum SignaturelevelEnum {
    Bearer = "Bearer",
    system = "System",
}

export enum TokenEnum {
    AcessToken = "AcessToken",
    RefreshToken = "RefreshToken"
}



export const GenerateToken = async ({
    Payload,
    secret,
    options
}: {
    Payload: object,
    secret: Secret
    options?: SignOptions,

}): Promise<String> => {
    return await sign(Payload, secret, options)
}


export const VerifyToken = async ({
    token,
    secret = process.env.USER_ACESS_TOKEN_KEY as string,
}: {
    token: string;
    secret: Secret;
}): Promise<JwtPayload> => {
    return await verify(token, secret) as JwtPayload
}


export const GetSignatureslevel = async (
    role: roleEnum
): Promise<SignaturelevelEnum> => {
    switch (role) {
        case roleEnum.admin:
            return SignaturelevelEnum.system;

        case roleEnum.user:
            return SignaturelevelEnum.Bearer;

        default:
            throw new BadRequestException(`Unknown role : ${role}`);
    }
};

export const GetTokenKeys = async (
    Signatures: SignaturelevelEnum
): Promise<{ Acess_key: string; refresh_key: string }> => {
    switch (Signatures) {
        case SignaturelevelEnum.Bearer:
            return {
                Acess_key: process.env.USER_ACESS_TOKEN_KEY!,
                refresh_key: process.env.USER_REFRESH_TOKEN_KEY!
            };


        case SignaturelevelEnum.system:
            return {
                Acess_key: process.env.ADMIN_ACESS_TOKEN_KEY!,
                refresh_key: process.env.ADMIN_REFRESH_TOKEN_KEY!
            };

        default:
            throw new BadRequestException(`Unknown signature level: ${Signatures}`);
    }
};



export const GenerateCredentials = async ({ User, Session_id }: { User: UserHydratedDocument, Session_id: string }) => {

    const Signature = await GetSignatureslevel(User.role)
    /// will detect if its bearer or system
    const TokenSecretKey = await GetTokenKeys(Signature)
    const jwtid = uuidv4()


    const AcessToken = await GenerateToken({
        Payload: { _id: User._id, Session_id },
        secret: TokenSecretKey.Acess_key,
        options: {
            expiresIn: Number(process.env.ACESS_TOKEN_EXPIRESIN as String),
            jwtid
        }
    })

    const RefreshToken = await GenerateToken({
        Payload: { _id: User._id, Session_id },
        secret: TokenSecretKey.refresh_key,
        options: {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRESIN as String),
            jwtid
        }
    })
    const Credentials = {
        AcessToken,
        RefreshToken
    }

    return Credentials

}


export const Decoded = async ({ Authorization,
    TokenType,
}: {
    Authorization: string,
    TokenType: TokenEnum,
}) => {

    const tokenRepositry = new TokenRepositry(TokenModel)
    const userRepositry = new UserRepositry(UserModel)

    const [Bearer, token] = Authorization.split(" ")
    if (!Bearer || !token) {
        throw new UnauthorizedException("Missing Token Parts")
    }

    const tokenkeys = await GetTokenKeys(Bearer as SignaturelevelEnum)

    const decoded = await VerifyToken({
        token,
        secret: TokenType === TokenEnum.AcessToken ? tokenkeys.Acess_key : tokenkeys.refresh_key,
    })

    if (!decoded.iat || !decoded._id) {
        throw new UnauthorizedException(" invalid token payload")

    }

    if (await tokenRepositry.findOne({
        filter: { jti: decoded.jti }
    })) {
        throw new UnauthorizedException("invalid or old login Credentals")
    }

    const User = await userRepositry.findOne({
        filter: {
            _id: decoded._id
        }
    })

    if (!User) {
        throw new NotFoundException(" this account is not created")
    }

    if (decoded.Session_id !== User.Session_id) {
        throw new UnauthorizedException(" this account loged in on another device")
    }

    return { User, decoded }

}

/** When the JWT was issued with `expiresIn`, `exp` is seconds since epoch. */
export const revokedTokenExpiresAt = (decoded: JwtPayload): Date => {
    if (decoded.exp != null) {
        return new Date(decoded.exp * 1000)
    }
    const iatSec = decoded.iat as number
    const ttlSec = Number(process.env.REFRESH_TOKEN_EXPIRESIN)
    return new Date(iatSec * 1000 + ttlSec * 1000)
}

const insertRevokedToken = async (Req: Request) => {
    const tokenRepositry = new TokenRepositry(TokenModel)
    const decoded = Req.decoded as JwtPayload
    const [token] = await tokenRepositry.create({
        data: [{
            jti: decoded.jti as string,
            expiresAt: revokedTokenExpiresAt(decoded),
            createdBy: Types.ObjectId.createFromHexString(String(Req.user?._id))
        }]
    }) || []

    if (!token) {
        throw new BadRequestException("failed to revoke this token ")
    }
    return token
}

/** Refresh rotation: blacklist the used refresh token; keep Session_id so the new pair stays valid. */
export const revokeRefreshTokenRotation = async (Req: Request) => {
    return insertRevokedToken(Req)
}

/** Logout current device / invalidate current token: blacklist and clear Session_id. */
export const revokeTokenAndClearSession = async (Req: Request) => {
    const userRepositry = new UserRepositry(UserModel)
    const user = await userRepositry.findOneAndupdate({
        filter: { _id: Req.user?._id },
        update: { Session_id: null },
        options: { new: true }
    })
    if (!user) {
        throw new NotFoundException("this account doesnt exists")
    }
    return insertRevokedToken(Req)
}