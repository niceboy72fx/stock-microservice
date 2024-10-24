##Cài đặt môi trường cho CoreEnterpriseWallet
1 - Yêu cầu phần mềm: <br>
  ```
    - NodeJS v16 trở lên (https://nodejs.org/en/)
    - yarn (gõ lệnh npm install -g yarn nếu đã cài nodejs)
    - pm2 (npm install -g pm2)
    
``````
2 - Cài đặt cho chat server và setup cho chạy trong background

`````````````
cd src
yarn install
yarn build
pm2 start
``````

3. Running unit test
``````
RUNNING TEST: yarn test -t TestHomeWelcome```````
