import React, { useState } from "react";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-6">
            <div>
              <h1 className="text-center ">Login</h1>
              <form action="">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Enter Username:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Enter Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="button" class="btn btn-primary">
                  Login
                </button>
              </form>
            </div>
          </div>
          <div className="2"></div>
          <div className="col-4">
            <img src="" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
