# Satoshi Safe

Welcome to the Satoshi Safe project! Satoshi Safe is developed by ProntoAI LLC and aims to provide [add project goal or summary here].

## Project Structure

The project is divided into the following main parts:

- **Frontend**: The user interface for the Satoshi Safe platform.
- **Functions**: Backend functions including serverless cloud functions.
- **Other Frontend**: Additional or experimental frontend code.

## Getting Started

To get started with Satoshi Safe, you'll need to set up your development environment. Follow the steps below to run the project locally.

### Prerequisites

- Node.js
- Yarn
- A Firebase account
- Twilio account for SMS services
- SMTP2GO account for email services
- Ethereum wallet and Alchemy for blockchain interactions

### Installation

1. Clone the repository to your local machine.
2. Navigate to the `frontend` directory:
3. Install the dependencies:
4. Repeat the steps for other directories as needed, such as `functions`.

### Configuration

You will need to configure your environment variables before running the project. Create a `.env` file in the `functions` directory with the following variables:

OPENAI_KEY=your_openai_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
BASE_URL=your_base_url
SMTP2GO_PASSWORD=your_smtp2go_password
SMTP2GO_USERNAME=your_smtp2go_username
OWNER_ADDRESS=your_owner_address
PRIVATE_EVM_KEY=your_private_evm_key
ALCHEMY_KEY=your_alchemy_key
TWILIO_NUMBER=your_twilio_number
BASE_URL_PLAYGROUND=your_base_url_playground
SQUID_INTEGRATOR_ID=your_squid_integrator_id
COVALENTHQ_KEY=your_covalenthq_key

## Contributing

We welcome contributions from the community. Please read our [Contributing Guide](CONTRIBUTING.md) for more information on how to get started.

## License

Satoshi Safe is open source software [licensed as MIT](LICENSE.md) (if applicable).

## Contact

For major questions, feature requests, or discussions, please email us at dev@getsatoshisafe.com.

---

Thank you for being a part of our community!