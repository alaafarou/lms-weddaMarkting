import { roleEnum } from "../../Schema/UserModel";



export const endpoints = {
    profileimage:[roleEnum.user,roleEnum.admin,roleEnum.superadmin]
}