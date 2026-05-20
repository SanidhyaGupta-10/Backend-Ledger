export const transactionFailureTemplate = (name: string, amount: number, toAccount: string) => {
  const subject = `Action Required: Transaction to ${toAccount} Failed`;

  const text = `Hello ${name},\n\nWe couldn't process your transaction of $${amount} to ${toAccount}. Please check your balance or payment details and try again.\n\nBest regards,\nThe Backend-Ledger Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #0f172a; }
    .bg-gradient {
      background: linear-gradient(135deg, #1e1b4b 0%, #7f1d1d 100%); /* Reddish tint */
      padding: 60px 20px; text-align: center;
    }
    .glass-card {
      max-width: 500px; margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); 
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px; padding: 40px; color: #ffffff; text-align: left;
    }
    .status-badge {
      display: inline-block; background: rgba(239, 68, 68, 0.2); /* Red badge */
      color: #f87171; padding: 6px 12px; border-radius: 99px;
      font-size: 12px; font-weight: 700; margin-bottom: 20px; text-transform: uppercase;
    }
    .amount-display { font-size: 42px; font-weight: 800; margin: 10px 0; color: rgba(255, 255, 255, 0.6); text-decoration: line-through; }
    .details-box { background: rgba(0, 0, 0, 0.2); border-radius: 16px; padding: 20px; margin: 25px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .label { color: rgba(255, 255, 255, 0.5); }
    .value { color: #ffffff; font-weight: 500; }
    .cta {
      display: inline-block; background: #ef4444; color: #ffffff !important;
      padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; width: 100%; text-align: center; box-sizing: border-box;
    }
    .footer { margin-top: 40px; font-size: 12px; color: rgba(255, 255, 255, 0.4); }
  </style>
</head>
<body>
  <div class="bg-gradient">
    <div class="glass-card">
      <div class="status-badge">Transaction Failed</div>
      <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">Attempted Amount</div>
      <div class="amount-display">$${amount.toLocaleString()}</div>
      
      <p style="color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.6;">
        Hi ${name}, your transfer couldn't be completed. This is usually due to insufficient funds or a security block from your bank.
      </p>

      <div class="details-box">
        <div class="detail-row">
          <span class="label">Intended Recipient</span>
          <span class="value">${toAccount}</span>
        </div>
        <div class="detail-row">
          <span class="label">Error Code</span>
          <span class="value">ERR_INSUFFICIENT_FUNDS</span>
        </div>
      </div>

      <a href="https://yourdashboard.com" class="cta">Retry Transaction</a>

      <div class="footer">
        If you didn't attempt this, please contact support immediately. <br>
        © 2024 Backend-Ledger Inc.
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}
