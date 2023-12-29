import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { UserInfo } from '../models/UserInfo';
import { Constants } from '../constants';
import { BehaviorSubject } from 'rxjs';


const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: Constants.ISSUER_URL,

  // strict discovery document disallows urls which not start with issuers url
  strictDiscoveryDocumentValidation: false,

  // URL to redirect the user to after login
  redirectUri: window.location.origin,

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: 'yourClientId',

  // set the scope for the permissions the client should request
  scope: 'openid profile email https://www.googleapis.com/auth/gmail.readonly',

  showDebugInformation: true,
};

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  userProfileSubject = new BehaviorSubject<UserInfo|null>(null)

  constructor(private readonly oAuthService: OAuthService, private readonly httpClient: HttpClient) {
        // confiure oauth2 service
        oAuthService.configure(authCodeFlowConfig);
        // manually configure a logout url, because googles discovery document does not provide it
        oAuthService.logoutUrl = Constants.LOUGOUT_URL;

        // loading the discovery document from google, which contains all relevant URL for
        // the OAuth flow
        oAuthService.loadDiscoveryDocument().then( () => {
          // // This method just tries to parse the token(s) within the url when
          // // the auth-server redirects the user back to the web-app
          // // It doesn't send the user the the login page
          oAuthService.tryLoginImplicitFlow().then( () => {

            // when not logged in, redirecvt to google for login
            // else load user profile
            if (!oAuthService.hasValidAccessToken()) {
              oAuthService.initLoginFlow()
            } else {
              oAuthService.loadUserProfile().then( (userProfile) => {
                this.userProfileSubject.next(userProfile as UserInfo)
              })
            }

          })
        });
   }

   emails(userId: string){
    return this.httpClient.get(`${Constants.GMAIL_BASE_URL}/gmail/v1/users/${userId}/messages`, { headers: this.authHeader() })
  }

  getMail(userId: string, mailId: string) {
    return this.httpClient.get(`${Constants.GMAIL_BASE_URL}/gmail/v1/users/${userId}/messages/${mailId}`, { headers: this.authHeader() })
  }

  isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken()
  }

  signOut() {
    this.oAuthService.logOut()
  }

  private authHeader() : HttpHeaders {
    return new HttpHeaders ({
      'Authorization': `Bearer ${this.oAuthService.getAccessToken()}`
    })
  }

}
