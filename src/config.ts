export class Config {
  public constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  public readonly envConfig = Object.freeze({
    slack: {
      token: this.env.SLACK_TOKEN,
      appToken: this.env.SLACK_APP_TOKEN,
      signingSecret: this.env.SLACK_SIGNING_SECRET,
    },
  });
}
