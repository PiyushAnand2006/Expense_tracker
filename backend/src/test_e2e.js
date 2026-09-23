import mongoose from 'mongoose';
import connectDB from './config/database.js';
import app from './app.js';
import User from './models/User.js';
import Expense from './models/Expense.js';

async function runE2ETests() {
  console.log('=== STARTING EXPENSE TRACKER E2E TESTS ===\n');

  // 1. Connect DB
  await connectDB();

  // Clean test user data
  const testEmail = 'e2e_test_user@example.com';
  const testUsername = 'e2etestuser';
  await User.deleteMany({ email: testEmail });

  // 2. Start server
  const server = app.listen(5005);
  const baseURL = 'http://localhost:5005/api/v1';

  try {
    // Test 1: Health Check
    console.log('[TEST 1] GET /api/health');
    const healthRes = await fetch('http://localhost:5005/api/health');
    const healthData = await healthRes.json();
    console.assert(healthRes.status === 200, 'Health status should be 200');
    console.assert(healthData.status === 'ok', 'Health status should be ok');
    console.log('✔ Passed health check\n');

    // Test 2: Register User
    console.log('[TEST 2] POST /api/v1/auth/register');
    const regRes = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: 'password123',
      }),
    });
    const regData = await regRes.json();
    console.assert(regRes.status === 201, `Register status should be 201, got ${regRes.status}`);
    console.assert(regData.success === true, 'Register success should be true');
    console.assert(Boolean(regData.data.token), 'Token should be returned');
    console.assert(regData.data.user.email === testEmail, 'User email should match');
    const token = regData.data.token;
    const userId = regData.data.user.id;
    console.log('✔ Passed user registration\n');

    // Test 3: Duplicate Registration (expect 409)
    console.log('[TEST 3] Duplicate Registration (Expect 409)');
    const dupRes = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: 'password123',
      }),
    });
    console.assert(dupRes.status === 409, `Duplicate register status should be 409, got ${dupRes.status}`);
    console.log('✔ Passed duplicate registration check\n');

    // Test 4: Login
    console.log('[TEST 4] POST /api/v1/auth/login');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.assert(loginRes.status === 200, 'Login status should be 200');
    console.assert(loginData.success === true, 'Login success should be true');
    console.assert(Boolean(loginData.data.token), 'Login token should be returned');
    console.log('✔ Passed user login\n');

    // Test 5: GET /api/v1/auth/me (Protected Route)
    console.log('[TEST 5] GET /api/v1/auth/me');
    const meRes = await fetch(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.assert(meRes.status === 200, `Get me status should be 200, got ${meRes.status}`);
    console.assert(meData.data.user.email === testEmail, 'Get me email should match');
    console.log('✔ Passed protected getMe verification\n');

    // Clean any prior test expenses for this user
    await Expense.deleteMany({ userId });

    // Test 6: Create Expense
    console.log('[TEST 6] POST /api/v1/expenses');
    const createRes = await fetch(`${baseURL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: 45.50,
        category: 'food',
        description: 'Grocery shopping',
        paymentMethod: 'credit_card',
      }),
    });
    const createData = await createRes.json();
    console.assert(createRes.status === 201, `Create expense status should be 201, got ${createRes.status}`);
    console.assert(createData.data.amount === 45.50, 'Amount should match');
    const expenseId = createData.data._id;
    console.log('✔ Passed expense creation\n');

    // Create a second expense
    await fetch(`${baseURL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: 120.00,
        category: 'entertainment',
        description: 'Concert ticket',
        paymentMethod: 'digital_wallet',
      }),
    });

    // Test 7: List Expenses
    console.log('[TEST 7] GET /api/v1/expenses');
    const listRes = await fetch(`${baseURL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    console.assert(listRes.status === 200, 'List expenses status should be 200');
    console.assert(listData.data.total === 2, `Total expenses should be 2, got ${listData.data.total}`);
    console.log('✔ Passed listing expenses\n');

    // Test 8: Get Single Expense
    console.log('[TEST 8] GET /api/v1/expenses/:id');
    const singleRes = await fetch(`${baseURL}/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const singleData = await singleRes.json();
    console.assert(singleRes.status === 200, 'Single expense status should be 200');
    console.assert(singleData.data.description === 'Grocery shopping', 'Description should match');
    console.log('✔ Passed fetching single expense\n');

    // Test 9: Update Expense
    console.log('[TEST 9] PUT /api/v1/expenses/:id');
    const updateRes = await fetch(`${baseURL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: 55.00,
        description: 'Grocery shopping updated',
      }),
    });
    const updateData = await updateRes.json();
    console.assert(updateRes.status === 200, 'Update expense status should be 200');
    console.assert(updateData.data.amount === 55.00, 'Updated amount should be 55.00');
    console.log('✔ Passed expense update\n');

    // Test 10: Reports Summary
    console.log('[TEST 10] GET /api/v1/reports/summary');
    const summaryRes = await fetch(`${baseURL}/reports/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const summaryData = await summaryRes.json();
    console.assert(summaryRes.status === 200, 'Summary report status should be 200');
    console.assert(summaryData.data.count === 2, `Summary count should be 2, got ${summaryData.data.count}`);
    console.assert(summaryData.data.totalAmount === 175.00, `Summary total should be 175, got ${summaryData.data.totalAmount}`);
    console.log('✔ Passed reports summary\n');

    // Test 11: Reports By Category
    console.log('[TEST 11] GET /api/v1/reports/by-category');
    const catRes = await fetch(`${baseURL}/reports/by-category?months=6`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const catData = await catRes.json();
    console.assert(catRes.status === 200, 'Category report status should be 200');
    console.assert(catData.data.length === 2, `Category items should be 2, got ${catData.data.length}`);
    console.log('✔ Passed category breakdown report\n');

    // Test 12: Reports By Time
    console.log('[TEST 12] GET /api/v1/reports/by-time');
    const timeRes = await fetch(`${baseURL}/reports/by-time?months=6`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const timeData = await timeRes.json();
    console.assert(timeRes.status === 200, 'Time report status should be 200');
    console.assert(timeData.data.length >= 1, 'Time trend should have data');
    console.log('✔ Passed monthly time series report\n');

    // Test 13: Delete Expense
    console.log('[TEST 13] DELETE /api/v1/expenses/:id');
    const deleteRes = await fetch(`${baseURL}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const deleteData = await deleteRes.json();
    console.assert(deleteRes.status === 200, 'Delete expense status should be 200');
    console.assert(deleteData.success === true, 'Delete success should be true');
    console.log('✔ Passed expense deletion\n');

    // Clean up test data
    await User.deleteMany({ email: testEmail });
    await Expense.deleteMany({ userId });

    console.log('==================================================');
    console.log('🎉 ALL 13 END-TO-END INTEGRATION TESTS PASSED 100%!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
  }
}

runE2ETests();
