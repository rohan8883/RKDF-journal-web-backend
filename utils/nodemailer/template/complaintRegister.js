export const complaintRegister = ({
    title,
    complaintNo,
    citizenName,
    ulbName,
    moduleName
}) => {
    const template = `<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            margin: 0;
            padding: 0;
        }

        table {
            border-collapse: collapse;
        }

        img {
            border: none;
            max-width: 100%;
            height: auto;
        }

        .email-wrapper {
            width: 100%;
            max-width: 600px;
            margin: auto;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
            border: 1px solid #eee;
        }

        .invoice-box {
            padding: 30px;
            font-size: 16px;
            line-height: 24px;
        }

        .invoice-box h2 {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 0;
        }

        .invoice-box p {
            margin: 10px 0;
        }

        .invoice-box table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
        }

        .invoice-box table th,
        .invoice-box table td {
            border: 1px solid #eee;
            padding: 8px;
        }

        .invoice-box table th {
            background-color: #eee;
            font-weight: bold;
            text-align: left;
        }

        .invoice-box .total td {
            border-top: 2px solid #eee;
            font-weight: bold;
        }

        .invoice-box .button {
            background-color: #2D7CE2;
            border: none;
            border-radius: 5px;
            color: white;
            box-shadow: 6px 6px 6px gray;
            font-weight: 600;
            padding: 10px 30px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .logo img {
            width: 30px;
            max-width: 100%;
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="invoice-box">
            <div style="display: flex;">
                <div><img style="width: 30px;"
                        src="https://jharkhandegovernance.com/dms/uploads/1724477856583-46652771.png"
                        style="width: 100%; max-width: 300px" alt="logo" /> </div>
                <div style="font-weight: bold;color: black; font-size: 20px; padding-left: 4px;">Jharkhand Grievance
                    Redressal</div>
            </div>

            <div style="font-weight: bold; font-size: 18px; padding-left: 4px;"># Complaint Registered</div>
            <p style="color: gray; font-weight: 600;"># Complaint No. : ${complaintNo}</p>

            <p style="margin-top: 20px; color: #2D7CE2; font-weight: 600;">Hi, ${citizenName}</p>
            <p style="color: gray;">Your complaint having complaint no: ${complaintNo} has been registered successfully.
                We will resolve it as soon as possible.</p>

            <table>
                <tr>
                    <th>Title</th>
                    <td>${title}</td>
                </tr>
                <tr>
                    <th>ULB</th>
                    <td>${ulbName}</td>
                </tr>
                <tr>
                    <th>Service</th>
                    <td>${moduleName}</td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 20px; text-align: center;">
            <p style="color: gray; font-style: italic;">For more details, please visit <a
                    href="https://jharkhandegovernance.com//">https://jharkhandegovernance.com/</a></p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <p style="color: gray; font-style: italic;">Please do not reply to this email.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; margin-bottom: 40px;">
            <a href="https://jharkhandegovernance.com//" style="text-decoration: none;">
                <button class="button"
                    style="background-color: #2D7CE2; border: none; border-radius: 5px; color: white; font-weight: 600; padding: 10px 30px; font-size: 16px; cursor: pointer; display: inline-block;">
                    View Status
                </button>
            </a>
        </div>
    </div>
</body>

</html>`;

    return template;
};

