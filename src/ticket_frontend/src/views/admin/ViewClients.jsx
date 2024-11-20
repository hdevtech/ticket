import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend';
import { useNavigate } from 'react-router-dom';

const ViewClients = () => {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate(); // To handle navigation to "Add Client" page

  // Fetch clients from the backend when the component loads
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientList = await ticket_backend.getClients(); // Assuming you have a getClients function in the backend
        setClients(clientList);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    fetchClients();
  }, []);

  // Navigate to the Add Client page
  const handleAddClient = () => {
    navigate('/admin/AddClient');
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* Add Client Button */}
          <Button variant="primary" onClick={handleAddClient} className="mb-3">
            Add Client
          </Button>

          <Card>
            <Card.Header>
              <Card.Title as="h5">Clients Table</Card.Title>
              <span className="d-block m-t-5">
                List of all clients who can participate in Fundraising.
              </span>
            </Card.Header>
            <Card.Body>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr key={client.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{client.name}</td>
                        <td>{client.username}</td>
                        <td>{client.phone_number}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No clients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ViewClients;
