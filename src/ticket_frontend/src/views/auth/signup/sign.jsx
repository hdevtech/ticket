import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';
import JWTSignup from './SignUp1';

const Signupp1  = () => {
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
              <JWTSignup />
              <p className="mb-0 text-muted">
                Already with account?{' '}
                <NavLink to="/login" className="f-w-400">
                  Sign In
                </NavLink>
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signupp1;
