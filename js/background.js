chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const url = `https://${request.host}/gateway/init_load.php?myid=${request.myid}`;
  const formData = new FormData();
  formData.append("pdata", JSON.stringify({ _t: request.token }));
  fetch(url, { method: "POST", body: formData }).then((response) => {
    new Response(response.body).text().then((text) => {
      sendResponse({ result: text });
    });
  });
  return true;
});
