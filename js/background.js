chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const initLoadUrl = `https://${request.host}/gateway/init_load.php?myid=${request.myid}`;
  const getAccountInfoUrl = `https://${request.host}/gateway/get_account_info.php?myid=${request.myid}`;
  const formData = new FormData();
  formData.append("pdata", JSON.stringify({ _t: request.token }));
  fetch(initLoadUrl, { method: "POST", body: formData }).then((response) => {
    new Response(response.body).text().then((text) => {
      const json = JSON.parse(text);
      const contacts = json.result.contact_dat;
      const contact_ids = Object.keys(contacts);
      const room_account_ids = Object.keys(
        Object.values(json.result.room_dat)
          .map((x) => x.m)
          .reduce((acc, x) => Object.assign(acc, x), {})
      );
      const account_ids = room_account_ids.filter(
        (x) => !contact_ids.includes(x)
      );
      if (account_ids.length) {
        const formDataForAccount = new FormData();
        formDataForAccount.append(
          "pdata",
          JSON.stringify({ aid: account_ids, _t: request.token })
        );
        fetch(getAccountInfoUrl, {
          method: "POST",
          body: formDataForAccount,
        }).then((response) => {
          new Response(response.body).text().then((text) => {
            const accounts = JSON.parse(text).result.account_dat;
            sendResponse({
              result: JSON.stringify({ ...contacts, ...accounts }),
            });
          });
        });
      } else {
        sendResponse({
          result: JSON.stringify({ ...contacts }),
        });
      }
    });
  });
  return true;
});
