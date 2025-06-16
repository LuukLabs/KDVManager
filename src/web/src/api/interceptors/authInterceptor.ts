class AuthInterceptor {
  private getToken?: () => Promise<string>;

  setAuthGetter(getToken?: () => Promise<string>) {
    this.getToken = getToken;
  }

  async intercept(config: RequestInit & { url: string }): Promise<RequestInit & { url: string }> {
    if (!this.getToken) {
      return config;
    }

    try {
      const token = await this.getToken();
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } catch (e) {
      console.log("Failed to get auth token:", e);
    }
    return config;
  }
}

export const authInterceptor = new AuthInterceptor();
