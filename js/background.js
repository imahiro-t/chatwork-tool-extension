chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "accounts") {
    const initLoadUrl = `https://${request.host}/gateway/init_load.php?myid=${request.myid}`;
    const getAccountInfoUrl = `https://${request.host}/gateway/get_account_info.php?myid=${request.myid}`;
    const formData = new FormData();
    formData.append("pdata", JSON.stringify({ _t: request.token }));
    fetch(initLoadUrl, { method: "POST", body: formData }).then((response) => {
      new Response(response.body).text().then((text) => {
        const json = JSON.parse(text);
        const teams = json.result.team_dat.children.reduce((acc, x) => {
          acc[x.id] = x;
          return acc;
        }, {});
        const rooms = Object.keys(json.result.room_dat).reduce((acc, x) => {
          console.log(acc, x);
          acc[x] = Object.keys(json.result.room_dat[x]["m"]);
          console.log(acc);
          return acc;
        }, {});
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
                result: JSON.stringify({
                  accounts: { ...contacts, ...accounts },
                  teams: teams,
                  rooms: rooms,
                }),
              });
            });
          });
        } else {
          sendResponse({
            result: JSON.stringify({
              accounts: { ...contacts },
              teams: teams,
              rooms: rooms,
            }),
          });
        }
      });
    });
  } else if (request.type === "team_members") {
    const roomTeamSettingUrl = `https://${request.host}/gateway/get_room_team_setting.php?myid=${request.myid}&room_id=${request.room_id}`;
    const formData = new FormData();
    formData.append("pdata", JSON.stringify({ _t: request.token }));
    fetch(roomTeamSettingUrl, { method: "POST", body: formData }).then(
      (response) => {
        new Response(response.body).text().then((text) => {
          const json = JSON.parse(text);
          const teamIds = (
            (json.result.room_dat[request.room_id] ?? {}).team_list ?? []
          ).map((x) => x.id);
          const resultPromises = teamIds.map(async (teamId) => {
            const teamMemberUrl = `https://${request.host}/gateway/get_team_members.php?myid=${request.myid}&team_id=${teamId}`;
            const response = await fetch(teamMemberUrl, {
              method: "POST",
              body: formData,
            });
            const text = await new Response(response.body).text();
            const ret = {};
            ret[teamId] = Object.values(JSON.parse(text).result.team_members);
            return ret;
          });
          Promise.all(resultPromises).then((results) => {
            sendResponse({
              result: JSON.stringify(
                results.reduce((acc, x) => Object.assign(acc, x), {})
              ),
            });
          });
        });
      }
    );
  } else if (request.type === "add_task") {
    const addTaskUrl = `https://${request.host}/gateway/add_task.php?myid=${request.myid}&room_id=${request.room_id}`;
    const task = request.task;
    const assign = request.assign;
    const limit_type = request.limit_type;
    const task_limit = request.task_limit;
    const formData = new FormData();
    formData.append(
      "pdata",
      JSON.stringify({
        _t: request.token,
        task: task,
        assign: assign,
        limit_type: limit_type,
        task_limit: task_limit,
      })
    );
    fetch(addTaskUrl, { method: "POST", body: formData }).then((response) => {
      new Response(response.body).text().then((text) => {
        const json = JSON.parse(text);
        sendResponse({
          result: JSON.stringify({ status: json.status }),
        });
      });
    });
  }
  return true;
});
