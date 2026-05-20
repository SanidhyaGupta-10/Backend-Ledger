export const transactionTemplate = (name: string, amount: number, toAccount: string) => {
  const subject = `Transaction Successful: $${amount.toLocaleString()} sent`;

  const text = `Hello ${name},\n\nYour transaction of $${amount} to ${toAccount} was successful.\n\nThank you for using Backend-Ledger.\n\nBest regards,\nThe Backend-Ledger Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; padding: 0; 
      font-family: 'Inter', -apple-system, sans-serif; 
      background-color: #0f172a; 
    }
    .bg-gradient {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%);
      padding: 60px 20px;
      text-align: center;
    }
    .glass-card {
      max-width: 500px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px); 
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      color: #ffffff;
      text-align: left;
    }
    .status-badge {
      display: inline-block;
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      padding: 6px 12px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
    .amount-display {
      font-size: 42px;
      font-weight: 800;
      margin: 10px 0;
      color: #ffffff;
    }
    .details-box {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 20px;
      margin: 25px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .label { color: rgba(255, 255, 255, 0.5); }
    .value { color: #ffffff; font-weight: 500; }
    .footer { margin-top: 40px; font-size: 12px; color: rgba(255, 255, 255, 0.4); }
  </style>
</head>
<body>
  <div class="bg-gradient">
    <div class="glass-card">
      <div class="status-badge">Success</div>
      <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">Payment Sent</div>
      <div class="amount-display">$${amount.toLocaleString()}</div>
      
      <p style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">
        Hi ${name}, your transfer has been processed successfully.
      </p>

      <div class="details-box">
        <div class="detail-row">
          <span class="label">Recipient Account</span>
          <span class="value">${toAccount}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date</span>
          <span class="value">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="detail-row" style="margin-bottom: 0;">
          <span class="label">Status</span>
          <span class="value" style="color: #4ade80;">Completed</span>
        </div>
      </div>

      <div class="footer">
        Reference ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()} <br>
        © 2024 Backend-Ledger Inc.
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}
