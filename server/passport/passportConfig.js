import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { findOrCreateOAuthUser } from '../services/authService.js';

// Google strategy — scope 'profile' and 'email' are what we ask Google's consent
// screen to share with us. Without 'email' scope, profile.emails would be undefined.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // accessToken/refreshToken here are GOOGLE's tokens for calling Google's API —
      // completely separate from our own JWT access/refresh tokens. We don't need
      // Google's tokens for anything beyond this one profile fetch, so we discard them.
      try {
        const user = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value || '',
        });
        done(null, user); // hands the user off to our callback route as req.user
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub strategy — 'user:email' scope is required because GitHub does NOT include
// email in the profile by default, even with a basic profile scope. Without this,
// profile.emails would be an empty array even for users with a public email.
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub can return multiple emails (work, personal, etc.) or none if the
        // user has all emails set to private. Prefer the verified primary one.
        const primaryEmail =
          profile.emails?.find((e) => e.primary && e.verified)?.value ||
          profile.emails?.[0]?.value;

        if (!primaryEmail) {
          return done(
            new Error('GitHub account has no accessible email. Please make an email public or use a different sign-in method.'),
            null
          );
        }

        const user = await findOrCreateOAuthUser({
          provider: 'github',
          providerId: profile.id,
          email: primaryEmail,
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value || '',
        });
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;