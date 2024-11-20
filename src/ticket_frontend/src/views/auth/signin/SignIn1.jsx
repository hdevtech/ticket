import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import JWTLogin from './JWTLogin';

const Signin1 = () => {
  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
              <div className="mb-4">
                <h3>ticket</h3>
                <i className="feather icon-unlock auth-icon" />
              </div>
              <JWTLogin />
              <p className="mb-2 text-muted">
                Forgot password?{' '}
                <NavLink to={'#'} className="f-w-400">
                  Reset
                </NavLink>
              </p>
              <p className="mb-0 text-muted">
                Don’t have an account?{' '}
                <NavLink to="/auth/signup" className="f-w-400">
                  Signup
                </NavLink>
              </p>
              <Alert variant="primary" className="text-start mt-3">
                User:
                <CopyToClipboard text="admin">
                  <Button variant="outline-primary" className="badge mx-2 mb-2" size="sm">
                    <i className="fa fa-user" /> admin
                  </Button>
                </CopyToClipboard>
                <br />
                Password:
                <CopyToClipboard text="admin123">
                  <Button variant="outline-primary" className="badge mx-2" size="sm">
                    <i className="fa fa-lock" /> admin123
                  </Button>
                </CopyToClipboard>
              </Alert>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
