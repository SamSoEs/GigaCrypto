import {useEffect, useState} from "react"
import "./App.css"
import Web3, { ConnectionCloseError } from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/load-contracts";
function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null
  });
  const [balance, setBalance] = new useState(null);
  const [account, setAccount] = useState(null);

  const canConnectToContract = account && web3Api.contract;

  const setAccountListener = (provider) => {
    provider.on("accountsChanged", _ => window.location.reload());
    provider.on("chainChanged", _ => window.location.reload());

       //provider._jsonRpcConnection.events.on("notification", (payload) => {
      // const {method, params} = payload;
      // if (method === 'metamask_unlockStateChanged') {
      //   setAccount(null);
      //}
      //})
  }
  useEffect(() =>  {
    const loadProvider = async () => {
      // With metamask we have access to window.ethereum and window.web3
      //metamsks injects the gloabl API to the websites
      //API allows the websites to request users, accounts, read data to the blockchain,
      //sign messages and transactions

      //const provider = await detectEthereumProvider();
      // if(provider){
      //  await provider.request({method: "eth_requestAccounts"});
      //   setWeb3Api({
      //     web3: new Web3(provider),
      //     provider
      //   });
      // }
      // else{
      //   console.log("Please install Metamask");
      // }

      let provider = null;

      if(window.ethereum){
        provider = window.ethereum;
        // try{
        //   await provider.request({method: "eth_requestAccounts"});
        // }
        // catch{
        //   console.error("Failed to connect to metamask");
        // }
      }
  
      else if(window.web3){
        provider = window.web3.currentProvider;
      }
      else if(!process.env.production){
        provider = new Web3.providers.HttpProvider("http://localhost:7545");
      }
      if(provider){
        setAccountListener(provider);
        const contract = await loadContract("Faucet", provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true
        });
      }else{
        setWeb3Api(web3Api => ({...web3Api, isProviderLoaded: true}))
        console.log("Please install metamask")
      }
    }
    loadProvider();
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const {contract, web3} = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(Number(web3.utils.fromWei(balance, "ether")));
    }
    web3Api.contract && loadBalance()
  },[web3Api])
  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0]);
    }
    web3Api.web3 && getAccounts();
  }, [web3Api.web3]);

  const addFunds = async () => {
    const {contract, web3} = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei(1, "ether")
    });
    window.location.reload();
  }

  const withdrawFunds = async () => {
    const {contract, web3} = web3Api;
    const amount = web3.utils.toWei(0.1, "ether")
    await contract.withdraw(amount, {
      from: account
    });
    window.location.reload();
  }
  return (
    <>
    <div className="faucet-wrapper">
      <div className="faucet">
      { web3Api.isProviderLoaded 
      ?
            <div className="is-flex is-align-items-center">
            <span>
              <strong className="mr-2">Accounts: </strong>
            </span>
            {
                  account ? <div>{account}</div>:
                  !web3Api.provider ? 
                  <>
                  <div className="notification is-warning is-size-7 is-rounded">
                    wallet is not detected!
                    <a target="_blank" href="https://docs.metamask.io">
                      Install metamask
                    </a>
                  </div>
                  </>:
                  <button 
                    className="button is-small"
                    onClick={() => web3Api.provider.request({method: "eth_requestAccounts"})}
                  >
                    Connect Wallet
                  </button>  
                }
        </div>:
        <span>Lookin for Web3...</span>
      }
        <div className="balance-view is-size-2 my-4">
          Current Balance <strong>{balance}</strong> ETH
        </div>
        { !canConnectToContract && 
          <i className="is-block mb-4">
            Connect to Ganache
          </i>
        }
        <button className="button is-primary mr-2"
        disabled={!canConnectToContract}
        onClick={addFunds}
        >
          Doante 1 ETH
        </button>
        <button className="button is-link"
        disabled={!canConnectToContract}
        onClick={withdrawFunds}
        >
          Withdraw 0.1 ETH
        </button>
      </div>
    </div>
    </>
  );
}

export default App;
