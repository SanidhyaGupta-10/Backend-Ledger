const template = (name) => {
    const subject = "Welcome to Backend-Ledger – Let's Get Started!";
    const text = `Hello ${name},\n\nWelcome to Backend-Ledger! We're thrilled to have you on board. Your account is now active, and you can begin managing your financial data with ease.\n\nIf you have any questions, simply reply to this email.\n\nBest regards,\nThe Backend-Ledger Team`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Base styles for modern typography */
    @import url('https://fonts.googleapis.com');
    body { 
      margin: 0; padding: 0; 
      font-family: 'Inter', -apple-system, sans-serif; 
      background-color: #0f172a; /* Deep tech-dark background */
    }
    
    /* The Vibrant Gradient Mesh Background */
    .bg-gradient {
      background: linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #9333ea 100%);
      padding: 60px 20px;
      text-align: center;
    }

    /* The "Glass" Container */
    .glass-card {
      max-width: 500px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.08); /* Low opacity fill */
      backdrop-filter: blur(16px); /* Frost effect */
      -webkit-backdrop-filter: blur(16px); 
      border: 1px solid rgba(255, 255, 255, 0.15); /* Glass edge highlight */
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      color: #ffffff;
      text-align: left;
    }

    .title { font-size: 28px; font-weight: 600; margin-bottom: 16px; letter-spacing: -0.5px; }
    .text { font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8); margin-bottom: 32px; }
    
    /* Sleek primary button */
    .cta {
      display: inline-block;
      background: #ffffff;
      color: #0f172a !important;
      padding: 14px 30px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
    }

    .footer { margin-top: 40px; font-size: 12px; color: rgba(255, 255, 255, 0.4); }
  </style>
</head>
<body>
  <div class="bg-gradient">
    <div class="glass-card">
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #60a5fa; margin-bottom: 12px;">
        Backend-Ledger
      </div>
      <h1 class="title">Hello, ${name}.</h1>
      <p class="text">
        Welcome to the next level of financial management. Your account is active and ready for deployment. Experience a ledgering interface designed for the speed of now.
      </p>
      
      <a href="#" class="cta">Launch Dashboard</a>

      <div class="footer">
        © 2024 Backend-Ledger Inc. <br>
        Built for developers, by developers.
      </div>
    </div>
  </div>
</body>
</html>
`;
    return { subject, text, html };
};
export default template;
