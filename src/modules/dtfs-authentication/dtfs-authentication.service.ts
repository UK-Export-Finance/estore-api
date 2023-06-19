export abstract class DtfsAuthenticationService {
  abstract getIdToken(): Promise<string>;
}
