// import { appConfig } from "~/configs";
// import { ApiService } from "./api.service";

// const { portal } = appConfig.ecoApps;
// const encodedCredentials = Buffer.from(`${portal.auth.userName}:${portal.auth.password}`).toString('base64');
// export const portalServer = new ApiService(portal.baseUrl, null, {
//     withCredentials: true,
//     Authorization: `Basic ${encodedCredentials}`
// });


export * from './api.service';
