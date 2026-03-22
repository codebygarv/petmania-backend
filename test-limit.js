async function testGoogle() {
  try {
    let res = await fetch('http://127.0.0.1:8080/api/user/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: "dummy_token" })
    });
    console.log('Status Code:', res.status);
    console.log(await res.json());
  } catch (err) {
    console.error(err);
  }
}

testGoogle();
