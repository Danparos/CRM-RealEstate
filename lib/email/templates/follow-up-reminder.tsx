interface FollowUpEmailProps {
  clientName: string
  clientClass: string
  lastActivity: string
  profileUrl: string
}

export function renderFollowUpEmail({
  clientName,
  clientClass,
  lastActivity,
  profileUrl,
}: FollowUpEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Follow-up Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f4f1;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f4f1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e2db;">
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#B8960C,#CD853F);"></td>
          </tr>
          <tr>
            <td style="padding:32px 40px 24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#a09880;">Follow-up Reminder</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#1c1a17;">${clientName}</h1>
              <p style="margin:0 0 16px;font-size:15px;color:#44403c;line-height:1.6;">
                This is a reminder to follow up with <strong>${clientName}</strong>. They are a
                <strong>Class ${clientClass}</strong> client and are overdue for contact.
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#faf8f5;border-radius:6px;border:1px solid #e5e2db;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#a09880;">Last Activity</p>
                    <p style="margin:0;font-size:14px;color:#44403c;">${lastActivity}</p>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background-color:#B8960C;">
                    <a href="${profileUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      View Client Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #e5e2db;background-color:#faf8f5;">
              <p style="margin:0;font-size:11px;color:#a09880;">This reminder was sent automatically by your CRM system.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
