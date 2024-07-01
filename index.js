const fs = require("fs");
let request = require("request-promise");
const { v4: uuidv4 } = require("uuid");
const cookieJar = request.jar();
request = request.defaults({ jar: cookieJar });
const htmlparser2 = require("htmlparser2");
const cheerio = require("cheerio");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getCookies(callback) {
  await request(
    "https://challenge.blackscale.media",
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return callback(null, response.headers["set-cookie"]);
      } else {
        return callback(error);
      }
    }
  );
}
async function main() {
  const htmlString = await request.get(
    "https://challenge.blackscale.media/register.php"
  );
  await getCookies(function (err, res) {
    if (!err) return res;
  });

  const dom = htmlparser2.parseDocument(htmlString);
  const $ = cheerio.load(dom);
  const stoken = $("input[name=stoken]").val();

  const cookieString = cookieJar.getCookieString(
    "https://challenge.blackscale.media/register.php"
  );
  //console.log(cookieString);
  //process.exit();

  const uuid = uuidv4();

  const email_signature = Buffer.from(`${uuid}@mailinator.com`).toString(
    "base64"
  );
  const formData = {
    fullname: uuid,
    stoken: stoken,
    email: `${uuid}@mailinator.com`,
    password: "qik%40I*G34xXK",
    email_signature: email_signature,
  };

  // Set the headers for the request
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: "https://challenge.blackscale.media",
    Referer: "https://challenge.blackscale.media/register.php",
    "User-Agent":
      "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    Connection: "keep-alive",
  };
  console.log("formData", formData);
  const verifyhtml = await request.post(
    "https://challenge.blackscale.media/verify.php",
    {
      form: formData,
      cookies: true,
      headers,
      //resolveWithFullResponse: true,
    }
  );

  fs.writeFileSync("./verifyhtml.html", verifyhtml);
  //console.log(verifyhtml);
  /** Since the Mailinator doesn't provide the public api to read inbox messages
   * In this setp I have added the maunal pass verfication code
   * But we can automate this process if we have paid version of the mailnator api ,
   * It provide the api to read the email boxes with randon generated email id in above steps.
   */

  let verification_code = "";

  rl.question("Please pass your email verification code ? ", function (code) {
    verification_code = code;
    rl.close();
  });

  rl.on("close", async function () {
    console.log(`Email verification code :  ${verification_code}`);
    const formData = {
      code: verification_code,
    };
    const catpchahtml = await request.post(
      "https://challenge.blackscale.media/captcha.php",
      {
        form: formData,
        cookies: true,
        headers,
        //resolveWithFullResponse: true,
      }
    );
    fs.writeFileSync("./catpchahtml.html", catpchahtml);
    console.log(catpchahtml);

    const captchform = {
      "g-recaptcha-response":
        "03AFcWeA4N3-dMT36A_dsaw6c_uKhNPKYGJsRY_ZocSye5mW5jZXutma_RE-ZqhF_H3yXjLkIKmSZnj9amv92HqsupTh03UwpozzQoeAKkwky0JDJ-w6wrCAvDq40meaUm0lMcLGNe4OUEyUokLZMuiVPoJ0S98yyYuWGd9bPkLaCagOol_nF-Tyl-BX55ByE3ENxw5_q3esODl18ulFDSo6vsmBh1KcEgNhKl03-lrqTSzxzEmQH6j4OuxcFSDm-XXE8AfoZx2e6J-P3epLD-HJ878tO24q_2BZCP7MntafNva3aouDFtydnyd5XsW_XH377WUSHOR3lI0z-QR6Txc808hX5fal9yHJMv93kHCZliI7BSICxbAdm2gDBpuYYnpZLbAAML-sGI33Xw9_a-ZXXBxHq4iZT2EqAx9GCapgmwal9yUfehqlmj6HjGfqvmj9AkWhNfjRA2BrTvO-Sq0iV8Bx0rVmRCBly986XaInG4_xoLo1raAely_Kuj3SuGLdnVyxmgIk8xDThUfqjpuvTKEifwuPK5Yal375iyPnhhYcqMIVwiDQqrW4-Z_5DupXJQVkY6FjhMx30bnVJDljxYc7vkCSgi5GmYbghLhE8koTcpZgRKb8e5cnrAbtTd4DrR_og2ksp8mjQ7obEZ-iVCOdQKcJAkzMz1wnHWg60I0_8X6Qje61ZnlqbKsgBq9DjL8XVDrj2elrpgZ0Be3zwqWC4eA1Uq8KrGjgqJTL0e9bSZxLllUiELMhCCD5PgbUds6kMFcP1vLa-oJTVXTLtCWfKfP7u0POb4F8f12hjMAhEzFXcqSP7kypjivqGAhxynknO6nTZlSlGgLV3R6R7d5VLR1a8PswZdqOCpAGrEes_VDWlYlGkhNLj98Pyr6I1p36sZyf1PpkeTPQEOIFCaikt78WgZK_WUKuwgrT0XjV_SMLLbfHmqNuGT20-XfloqFRCc0zOjjLQp3VoKI2nBHXPDMgAnrRuYfPfRzSF9xK2UgYD0bjdBbTyLdfL75mcuJod3Z7AVJrIUxc-AjT28kD2_HgHbIu7XxlfKVyKh8x-0lYe8gvhgUv1794OL0qzXDidnz55IfB0tcyAwf-_MO6qroOxSPr9aPMqkGXFoN9NgvqgyRvUSoqBwbnqP-MCRVEuAnrcf0GyTDX5DqE7l3ygnLJjBS1bu8b_rCwlmFYLIKbR7oxgQS5dhzB7EA3H4OA31AVYdWwcp3MaEtsPdRU92f2140bJjyaSsAaogYTY9NFBpx9B1SLNjimx8OabYkfn6C89E16qDHk492lmvvi1K5gDt3z1csarXzMn6jjFMf7ljp6pgCnpmc5ESV3AXq_QskAAGaiWa_ZiTuykGYJAk6g58C2JG3mjwHfCmDmodlZaoEihREmAfHtqbYb1g7gerGZU7i__AbWcyeSINKe-ne7vuaMESgaMtWbaynis7WotcCsVIZ0Ri04RwX9z8kwMeHiUe87kphbZwufc9WLvobLRZc_VrGvL8dtu7elQXteIZK6sTUfmaXGM4_PAo0OhibfK1WWOrXPjq67sRiQLx_Xkehs0preU1ZopMuo1_CHVFbhHSczHGqGEfw4-cFjb2Xb9c3hpeTj99B5WFC7wGN4YcbrX0yCvQbh8oW26wF59pamMpbwPAmBSiD1u8tRqdunWdfOQQE5tZ71co7ZTE7xuikm3NdQLyI2T1NFi0zTjOYOR5Unwol__LFLHWZ8x8dCAurWktYzhOJ5t0oa1gTv7zkvlkzt7Fe2JcveqXPBDczfk3HNL_xaAQY59bEqMtCItfPQXhS2GoTd2zc2ahbJHMn5Jt8pGZoe5CGypmyKdguo4QLek9EEmBqe0wgmATPKcG2_Oz-XVoZ1Yh5u2-jyMLEUXtEmCVZFH-PAM44FYQLYgweUOQ__qiiGbrChT-c8OwEkK8TCdrC8ALfPvoyGBP2xelUhEPwi_vioZWnd9-kjEZ-bl0pbIE86e0ON1g_XjfSACg6GbdiidV01PBUefmtJio9W5uYqAAitn2HBKatAI",
    };
    const completehtml = await request.post(
      "https://challenge.blackscale.media/complete.php",
      {
        form: captchform,
        cookies: true,
        headers,
        //resolveWithFullResponse: true,
      }
    );
    fs.writeFileSync("./completehtml.html", completehtml);
    console.log(completehtml);

    process.exit(0);
  });
}

main();
