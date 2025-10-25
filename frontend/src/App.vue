<template>
    <div id="app">
      <router-view></router-view>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App'
  }
  </script>
  
  <style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-success {
    background-color: #28a745;
    color: white;
  }
  
  .btn-danger {
    background-color: #dc3545;
    color: white;
  }
  
  .btn-warning {
    background-color: #ffc107;
    color: black;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  .table th,
  .table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .table th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  
  .status-pending {
    color: #ffc107;
    font-weight: bold;
  }
  
  .status-approved {
    color: #28a745;
    font-weight: bold;
  }
  
  .status-rejected {
    color: #dc3545;
    font-weight: bold;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
  }
  
  .tab-btn {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  
  .tab-btn.active {
    border-bottom-color: #007bff;
    color: #007bff;
    font-weight: bold;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  </style>