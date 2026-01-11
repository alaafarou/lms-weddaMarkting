import { type Request, type Response, type NextFunction } from "express";
import { roleEnum, UserModel } from "../../Schema/UserModel";
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { profileimageReponse } from "./UserEntites";
import { IMultter } from "../Utilis/multer/cloud.multer";
import { BadRequestException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { UserResponse } from "../AuthModule/AuthEntites";
import { createRevokeToken, logoutEnum } from "../Utilis/Security/security";
import { CompareHash, GenerateHash } from "../Utilis/Security/hash";

class UserService {

    private UserModel!: UserRepositry


    constructor() {}

    private ReinitializeModels(req: Request) {
        const  host  = req.headers.host
        if (host) {
            const models = req.models;
            this.UserModel = new UserRepositry(models?.User!);
        }
        else {
            this.UserModel = new UserRepositry(UserModel);
        }
    }


    profile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        return SuccesResponse<UserResponse>({ res, data: { user: req.user! } })
    }

    updateprofileimage = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const file = req.file as IMultter
        const User = await this.UserModel.findOneAndupdate({
            filter: {
                _id: req.user?._id,
                DeletedAt: { $exists: false }
            },
            update: {
                profileimage: file.finalpath,
            }
        })
        if (!User) {
            throw new BadRequestException("failed to update profile image")
        }
        return SuccesResponse<profileimageReponse>({ res, data: { ImagePath: User.profileimage as String, User } })
    }

    updatepassword = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { password, newpassword, flag } = req.body
        if (! await CompareHash({ plaintext: password, HashedValue: req.user?.password as string })) {
            throw new BadRequestException("this password is wrong ")
        }
        let updateData: any = {}
        switch (flag) {
            case logoutEnum.AllDevices:
                updateData.changeCredentialsTime = new Date()
                break;
            default:
                await createRevokeToken(req)
                break;
        }
        const User = await this.UserModel.findOneAndupdate({
            filter: {
                _id: req.user?._id
            },
            update: {
                password: await GenerateHash({ plaintext: newpassword })
            }
        })
        if (!User) {
            throw new BadRequestException("failed to update the user")
        }
        return SuccesResponse<UserResponse>({ res, data: { user: User } })
    }

    // changerole = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    //     this.ReinitializeModels(req)
    //     const { UserId } = req.params as unknown as { UserId: Types.ObjectId }
    //     const { role } = req.body
    //     const User = await this.UserModel.findOneAndupdate({
    //         filter: { _id: UserId, role: roleEnum.user },
    //         update: { role }
    //     })
    //     if (!User) {
    //         throw new NotFoundException("failed to update the User role ")
    //     }
    //     return SuccesResponse<UserResponse>({ res, data: { user: User } })
    // }

    logout = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { flag } = req.body
        let statuscode = 200
        switch (flag) {
            case logoutEnum.AllDevices:
                await this.UserModel.updateOne({
                    filter: {
                        _id: req.user?._id
                    },
                    update: {
                        changeCredentialsTime: new Date()
                    }
                })

                break;

            default:
                await createRevokeToken(req)
                statuscode = 201
                break;
        }

        return SuccesResponse({ res, statuscode })
    }

    freezeUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { UserId } = req.params;
        const  host  = req.headers.host
        const CurrentAdminId = req.user!;
        if (host && CurrentAdminId.role === roleEnum.superadmin) {
            throw new BadRequestException("sorry Teant Canot Acess Acount that is Super admin")
        }
        if (!UserId || (UserId == CurrentAdminId.toString())) {
            const User = await this.UserModel.findOneAndupdate({
                filter: {
                    _id: CurrentAdminId._id,
                    DeletedAt: { $exists: false }
                },
                update:
                {
                    DeletedAt: new Date(),
                    DeletedBy: CurrentAdminId._id,
                    $unset: { RestoredAt: 1, RestoredBy: 1 }
                }

            });
            if (!User) {
                throw new BadRequestException("sorry Errore while Deleting admin acount");
            }
            return SuccesResponse({ res, data: "Admin deleted self successfully" });
        }
        const targetUser = await this.UserModel.findOneAndupdate({
            filter: {
                _id: UserId,
                DeletedAt: { $exists: false },
            },
            update: {
                DeletedAt: new Date(),
                DeletedBy: CurrentAdminId._id,
                $unset: { RestoredAt: 1, RestoredBy: 1 }
            },
            options: {
                new: false
            }
        })
        if (!targetUser) {
            throw new NotFoundException("User not found or already deleted");
        }
        if (targetUser.role === roleEnum.admin) {
            throw new BadRequestException("sorry cannot delete admin account");
        }
        return SuccesResponse({ res, data: "User deleted successfully" });
    };

    RestoreUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { UserId,tenantId } = req.params;
        const CurrentAdminId = req.user!;
        if (tenantId && CurrentAdminId.role === roleEnum.superadmin) {
            throw new BadRequestException("sorry Teant Canot Acess Acount that is Super admin")
        }
        if (!UserId || (UserId == CurrentAdminId.toString())) {
            const User = await this.UserModel.findOneAndupdate({
                filter: {
                    _id: CurrentAdminId._id,
                    DeletedAt: { $exists: true }
                },
                update:
                {
                    RestoredAt: new Date(),
                    RestoredBy: CurrentAdminId._id,
                    $unset: { DeletedAt: 1, DeletedBy: 1 }
                }

            });
            if (!User) {
                throw new BadRequestException("sorry Errore while restoring admin acount");
            }
            return SuccesResponse({ res, data: "Admin account restored successfully" });
        }
        const targetUser = await this.UserModel.findOneAndupdate({
            filter: {
                _id: UserId,
                DeletedAt: { $exists: true }
            },
            update:
            {
                RestoredAt: new Date(),
                RestoredBy: CurrentAdminId._id,
                $unset: { DeletedAt: 1, DeletedBy: 1 }
            },
            options: {
                new: false
            }
        })
        if (!targetUser) {
            throw new NotFoundException("User not found or already restored");
        }
        if (targetUser.role === roleEnum.admin) {
            throw new BadRequestException("sorry cannot restore admin account");
        }
        return SuccesResponse({ res, data: "User restored successfully" });
    };

    DeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { UserId ,tenantId} = req.params;
        const CurrentAdminId = req.user!;
        if (tenantId && CurrentAdminId.role === roleEnum.superadmin) {
            throw new BadRequestException("sorry Teant Canot Acess Acount that is Super admin")
        }
        if (!UserId || (UserId == CurrentAdminId.toString())) {
            const User = await this.UserModel.findOneAndDelete({
                filter: {
                    _id: CurrentAdminId._id,
                    DeletedAt: { $exists: true }
                },
            });
            if (!User) {
                throw new BadRequestException("sorry Errore while Deleting admin acount");
            }
            return SuccesResponse({ res, data: "Admin deleted self successfully" });
        }
        const targetUser = await this.UserModel.findOneAndDelete({
            filter: {
                _id: UserId,
                DeletedAt: { $exists: true },
                role: roleEnum.user
            },
            options: {
                new: false
            }
        })
        if (!targetUser) {
            throw new NotFoundException("sorry this user cant be found as it may be already deleted");
        }
        if (targetUser.role !== roleEnum.user) {
            throw new NotFoundException("sorry we cant delet admin User");
        }
        return SuccesResponse({ res, data: "User restored successfully" });
    };

  

}







export default new UserService() 