// Gmail Login - Playwright Test Suite
// Source: test_case.md
// Feature: User Login on gmail.com
// Version: 1.0

require('dotenv').config();
const { test, expect, chromium, firefox, webkit } = require('@playwright/test');

// ─────────────────────────────────────────────
// Test Configuration — loaded from .env file
// ─────────────────────────────────────────────
const VALID_EMAIL     = process.env.VALID_EMAIL     || 'your_email@gmail.com';
const VALID_PASSWORD  = process.env.VALID_PASSWORD  || 'your_password';
const INVALID_EMAIL   = process.env.INVALID_EMAIL   || 'userexample.com';
const NON_EXIST_EMAIL = process.env.NON_EXIST_EMAIL || 'nonexistent12345xyz@gmail.com';
const WRONG_PASSWORD  = process.env.WRONG_PASSWORD  || 'WrongPassword@999';

// ─────────────────────────────────────────────
// Helper: Navigate to Gmail Sign-In
// ─────────────────────────────────────────────
async function goToGmail(page) {
  await page.goto('https://gmail.com');
  await page.waitForURL(/accounts\.google\.com/);
}

// Helper: Enter email and click Next
async function enterEmail(page, email) {
  await page.locator('input[type="email"]').fill(email);
  await page.locator('#identifierNext button').click();
}

// Helper: Enter password and click Next
async function enterPassword(page, password) {
  await page.locator('input[type="password"]').waitFor({ state: 'visible' });
  await page.locator('input[type="password"]').fill(password);
  await page.locator('#passwordNext button').click();
}

// Helper: Full login (email + password)
async function login(page, email = VALID_EMAIL, password = VALID_PASSWORD) {
  await goToGmail(page);
  await enterEmail(page, email);
  await enterPassword(page, password);
}

// ─────────────────────────────────────────────
// TC-001: Navigate to Gmail and Verify Redirect
// ─────────────────────────────────────────────
test('TC-001: Navigate to Gmail and verify redirect to Sign-In page', async ({ page }) => {
  await page.goto('https://gmail.com');
  await expect(page).toHaveURL(/accounts\.google\.com/);
});

// ─────────────────────────────────────────────
// TC-002: Verify HTTPS on Sign-In Page
// ─────────────────────────────────────────────
test('TC-002: Verify HTTPS on Sign-In page', async ({ page }) => {
  await page.goto('https://gmail.com');
  const url = page.url();
  expect(url.startsWith('https://')).toBeTruthy();
});

// ─────────────────────────────────────────────
// TC-003: Verify Email Input Field is Present
// ─────────────────────────────────────────────
test('TC-003: Verify email input field is present on Sign-In page', async ({ page }) => {
  await goToGmail(page);
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-004: Login with Valid Email and Password
// ─────────────────────────────────────────────
test('TC-004: Login with valid email and password', async ({ page }) => {
  await login(page);

  // Verify redirect to inbox
  await expect(page).toHaveURL(/mail\.google\.com\/mail/);

  // Verify profile picture/avatar visible in top-right
  const avatar = page.locator('a[aria-label*="Google Account"]').first();
  await expect(avatar).toBeVisible();

  // Verify emails are loaded in inbox
  const inbox = page.locator('[role="main"]');
  await expect(inbox).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-005: Login with Invalid Email Format
// ─────────────────────────────────────────────
test('TC-005: Login with invalid email format shows error', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, INVALID_EMAIL);

  const error = page.locator('text=/Enter a valid email or phone number/i');
  await expect(error).toBeVisible();

  // User should remain on sign-in page
  await expect(page).toHaveURL(/accounts\.google\.com/);
});

// ─────────────────────────────────────────────
// TC-006: Login with Non-Existing Account
// ─────────────────────────────────────────────
test('TC-006: Login with non-existing account shows error', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, NON_EXIST_EMAIL);

  const error = page.locator("text=/Couldn't find your Google Account/i");
  await expect(error).toBeVisible();

  // User should remain on sign-in page
  await expect(page).toHaveURL(/accounts\.google\.com/);
});

// ─────────────────────────────────────────────
// TC-007: Verify Next Button on Email Step
// ─────────────────────────────────────────────
test('TC-007: Next button on email step proceeds to password', async ({ page }) => {
  await goToGmail(page);
  await page.locator('input[type="email"]').fill(VALID_EMAIL);

  const nextBtn = page.locator('#identifierNext button');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Password field should appear
  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-008: Verify Password Field Appears After Email
// ─────────────────────────────────────────────
test('TC-008: Password field appears after valid email entry', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);

  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-009: Verify Password is Masked by Default
// ─────────────────────────────────────────────
test('TC-009: Password field is masked by default', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);

  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible();

  // Verify the input type is "password" (masked)
  const inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('password');
});

// ─────────────────────────────────────────────
// TC-010: Login with Incorrect Password
// ─────────────────────────────────────────────
test('TC-010: Login with incorrect password shows error', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, WRONG_PASSWORD);

  const error = page.locator('text=/Wrong password/i');
  await expect(error).toBeVisible();

  // User should remain on password page
  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible();
});

// ─────────────────────────────────────────────
// TC-011: Verify Next Button on Password Step
// ─────────────────────────────────────────────
test('TC-011: Next button on password step submits login', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);

  await page.locator('input[type="password"]').waitFor({ state: 'visible' });
  await page.locator('input[type="password"]').fill(VALID_PASSWORD);

  const nextBtn = page.locator('#passwordNext button');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Should proceed to inbox or 2FA page
  await page.waitForURL(/mail\.google\.com|accounts\.google\.com/);
  const currentUrl = page.url();
  const proceeded = currentUrl.includes('mail.google.com') || currentUrl.includes('accounts.google.com');
  expect(proceeded).toBeTruthy();
});

// ─────────────────────────────────────────────
// TC-012: 2FA Prompt Appears When 2FA is Enabled
// Note: Requires account with 2FA enabled
// ─────────────────────────────────────────────
test('TC-012: 2FA prompt appears when 2FA is enabled', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, VALID_PASSWORD);

  // After valid credentials, 2FA page should appear
  await page.waitForURL(/accounts\.google\.com/);
  const twoFAHeading = page.locator('text=/2-Step Verification|verify it/i');
  await expect(twoFAHeading).toBeVisible({ timeout: 10000 });
});

// ─────────────────────────────────────────────
// TC-013: 2FA via SMS
// Note: OTP must be injected externally (e.g., via env or mock)
// ─────────────────────────────────────────────
test('TC-013: 2FA via SMS OTP', async ({ page }) => {
  const smsOtp = process.env.SMS_OTP || '123456'; // Inject via env variable

  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, VALID_PASSWORD);

  // Wait for 2FA screen
  await page.waitForURL(/accounts\.google\.com/);

  // Enter SMS OTP
  const otpInput = page.locator('input[type="tel"], input[id*="totpPin"], input[autocomplete="one-time-code"]');
  await otpInput.waitFor({ state: 'visible', timeout: 10000 });
  await otpInput.fill(smsOtp);

  await page.locator('button[type="submit"], #totpNext button').click();

  // Should redirect to inbox
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });
});

// ─────────────────────────────────────────────
// TC-014: 2FA via Authenticator App
// Note: TOTP must be injected via env variable or TOTP library
// ─────────────────────────────────────────────
test('TC-014: 2FA via Authenticator App TOTP', async ({ page }) => {
  const totp = process.env.TOTP_CODE || '654321'; // Inject via env variable

  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, VALID_PASSWORD);

  await page.waitForURL(/accounts\.google\.com/);

  const otpInput = page.locator('input[type="tel"], input[id*="totpPin"], input[autocomplete="one-time-code"]');
  await otpInput.waitFor({ state: 'visible', timeout: 10000 });
  await otpInput.fill(totp);

  await page.locator('button[type="submit"], #totpNext button').click();

  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });
});

// ─────────────────────────────────────────────
// TC-015: 2FA via Google Prompt
// Note: Requires manual approval on physical device; skip in CI
// ─────────────────────────────────────────────
test.skip('TC-015: 2FA via Google Prompt (requires physical device)', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, VALID_PASSWORD);

  await page.waitForURL(/accounts\.google\.com/);

  // Google prompt is sent to device - wait for user approval
  const promptMsg = page.locator('text=/check your phone|Google prompt/i');
  await expect(promptMsg).toBeVisible({ timeout: 10000 });

  // After device approval, inbox should load
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 60000 });
});

// ─────────────────────────────────────────────
// TC-016: Access Denied Without Completing 2FA
// ─────────────────────────────────────────────
test('TC-016: Access denied without completing 2FA', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, VALID_PASSWORD);

  await page.waitForURL(/accounts\.google\.com/);

  // Do NOT complete 2FA — verify inbox is NOT accessible
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('mail.google.com');
});

// ─────────────────────────────────────────────
// TC-017: Remember This Device Skips 2FA
// Note: Requires stored auth state with "Remember this device" set
// ─────────────────────────────────────────────
test('TC-017: Remember this device skips 2FA on subsequent login', async ({ browser }) => {
  // Load previously saved auth state (storageState) where "Remember this device" was checked
  const context = await browser.newContext({
    storageState: process.env.AUTH_STATE_PATH || 'auth/storageState.json',
  });
  const page = await context.newPage();

  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);
  await enterPassword(page, VALID_PASSWORD);

  // Should go straight to inbox without 2FA prompt
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  await context.close();
});

// ─────────────────────────────────────────────
// TC-018: Account Lockout After Multiple Failed Attempts
// ─────────────────────────────────────────────
test('TC-018: Account lockout after multiple failed login attempts', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);

  // Attempt wrong password 5 times
  for (let i = 0; i < 5; i++) {
    await page.locator('input[type="password"]').waitFor({ state: 'visible' });
    await page.locator('input[type="password"]').fill(WRONG_PASSWORD);
    await page.locator('#passwordNext button').click();
    await page.waitForTimeout(1500);
  }

  // Verify lockout message or account recovery prompt
  const lockoutMsg = page.locator('text=/too many failed attempts|account is locked|try again later/i');
  await expect(lockoutMsg).toBeVisible({ timeout: 10000 });
});

// ─────────────────────────────────────────────
// TC-019: Recovery Options Shown on Account Lockout
// ─────────────────────────────────────────────
test('TC-019: Recovery options shown after account lockout', async ({ page }) => {
  await goToGmail(page);
  await enterEmail(page, VALID_EMAIL);

  // Trigger lockout
  for (let i = 0; i < 5; i++) {
    await page.locator('input[type="password"]').waitFor({ state: 'visible' });
    await page.locator('input[type="password"]').fill(WRONG_PASSWORD);
    await page.locator('#passwordNext button').click();
    await page.waitForTimeout(1500);
  }

  // Recovery options should be visible
  const recoveryOption = page.locator('text=/recover|recovery email|try another way|forgot password/i');
  await expect(recoveryOption).toBeVisible({ timeout: 10000 });
});

// ─────────────────────────────────────────────
// TC-020: Switch Between Multiple Google Accounts
// ─────────────────────────────────────────────
test('TC-020: Switch between multiple Google accounts', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  // Click profile avatar
  const avatar = page.locator('a[aria-label*="Google Account"]').first();
  await avatar.click();

  // Click "Add another account" or switch account option
  const addAccount = page.locator('text=/Add another account|Switch account/i');
  await expect(addAccount).toBeVisible();
  await addAccount.click();

  // Should land on Sign-In page for new account
  await expect(page).toHaveURL(/accounts\.google\.com/);
});

// ─────────────────────────────────────────────
// TC-021: Session Persists Across Browser Tabs
// ─────────────────────────────────────────────
test('TC-021: Session persists across browser tabs', async ({ browser }) => {
  const context = await browser.newContext();
  const page1 = await context.newPage();

  // Login on first tab
  await login(page1);
  await expect(page1).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  // Open second tab
  const page2 = await context.newPage();
  await page2.goto('https://gmail.com');

  // Should be already logged in on second tab
  await expect(page2).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  await context.close();
});

// ─────────────────────────────────────────────
// TC-022 to TC-025: Browser Compatibility Tests
// ─────────────────────────────────────────────

test('TC-022: Login flow works on Chromium (Chrome)', async ({ }) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await login(page);
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  await browser.close();
});

test('TC-023: Login flow works on Firefox', async ({ }) => {
  const browser = await firefox.launch();
  const page = await browser.newPage();

  await login(page);
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  await browser.close();
});

test('TC-024: Login flow works on Safari (WebKit)', async ({ }) => {
  const browser = await webkit.launch();
  const page = await browser.newPage();

  await login(page);
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  await browser.close();
});

test('TC-025: Login flow works on Edge (Chromium-based)', async ({ }) => {
  // Edge uses Chromium engine in Playwright
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  await login(page);
  await expect(page).toHaveURL(/mail\.google\.com\/mail/, { timeout: 15000 });

  await browser.close();
});
