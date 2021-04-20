import axios from 'axios';
import React, { Component } from 'react'

export class AuthDemo extends Component {
  state = {
    isLoggedIn: false,
    profileData: null
  }
  componentDidMount() {
    console.log('mounting')
    this.fetchProfile()
  }
  handleSubmit = e => {
    e.preventDefault();
    // endpoint is at http://localhost:8080/login
    const username = e.target.username.value;
    const password = e.target.password.value;
    console.log(username, password)
    axios.post('http://localhost:8080/login', {
      username: username,
      password: password
    }).then(response => {
      console.log('Login Response', response.data.token)
      sessionStorage.setItem('clientAuthToken', response.data.token)
      this.setState({isLoggedIn: true}, this.fetchProfile)
    })
    .catch( err => console.log("login error", err.response.data))
  }
  fetchProfile = () => {
    const authToken = sessionStorage.getItem('clientAuthToken')
    axios.get('http://localhost:8080/profile', {
      headers: {
        authorization: `Bearer ${authToken}`
      }
    }).then(response => this.setState({
      profileData: response.data
    })).catch(err => console.log('profile error', err.response.data))
  }
  render() {
    return (
      <div>
        <h1>Auth Client Demo</h1>
        {!this.state.isLoggedIn && 
          <form onSubmit={this.handleSubmit}>
            <h2>Login Form</h2>
            <input name="username" type="text" placeholder="User Name"/>
            <input name="password" type="password" placeholder="Password"/>
            <button>Submit</button>
          </form>
        }
        {this.state.isLoggedIn &&
        <>
          <h2>Authorized Page</h2>
          <h3>Welcome, {this.state.profileData && this.state.profileData.tokenInfo.name}</h3>
          <h3>User Name: {this.state.profileData && this.state.profileData.tokenInfo.username}</h3>
          <h3>Loves: {this.state.profileData && this.state.profileData.sensitiveInformation.secret}</h3>
        </>
        }
      </div>
    )
  }
}

export default AuthDemo
