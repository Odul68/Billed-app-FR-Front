/**
 * @jest-environment jsdom
 */

 import { screen, waitFor } from "@testing-library/dom"
 import mockStore from "../__mocks__/store"
 import '@testing-library/jest-dom'
 import userEvent from "@testing-library/user-event";
 import Bills from '../containers/Bills'
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import router from "../app/Router.js";
 
 jest.mock("../app/store", () => mockStore)
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
 
     test("Then bill icon in vertical layout should be highlighted", async () => {
 
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       await waitFor(() => screen.getByTestId('icon-window'))
       const windowIcon = screen.getByTestId('icon-window')
       
// ++++++++++++++++++++++++++++++++++++++++++++ Test added +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
       expect(windowIcon.classList.contains('active-icon')).toBe(true)
// ++++++++++++++++++++++++++++++++++++++++++++ Test added +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
     })
     
 
     test("Then bills should be ordered from earliest to latest", async () => {
 
       document.body.innerHTML = BillsUI({ data: bills })
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = [...dates].sort(antiChrono)
       expect(dates).toEqual(datesSorted)
     })
 
 
 
// ++++++++++++++++++++++++++++++++++++++++++++ Tests added +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
 
     describe('When the new bill button is clicked', () => {
       test('Then it should navigate to the new bill page', () => {
 
         const onNavigate = (pathname) => {
           document.body.innerHTML = ROUTES({ pathname })
           }
   
         const bill = new Bills({
           document,
           onNavigate,
           mockStore,
           localStorage: window.localStorage,
         })
 
         const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e))
         const newBillBtn = screen.getByTestId("btn-new-bill")
         newBillBtn.addEventListener("click", handleClickNewBill)
         userEvent.click(newBillBtn)
 
         expect(handleClickNewBill).toHaveBeenCalled()
         expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
         expect(screen.getByTestId("form-new-bill")).toBeTruthy()
       })
     })
 
 
     describe('When the eye icon is clicked', () => {
       test('Then the modal bill proof should be displayed', () => {
 
        const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname })
         }
 
       document.body.innerHTML = BillsUI({ data: bills })
       $.fn.modal = jest.fn()
 
       const bill = new Bills({
         document,
         onNavigate,
         mockStore,
         localStorage: window.localStorage,
       })
 
       const iconEye = screen.getAllByTestId("icon-eye")
       const handleClickIconEye = jest.fn((icon) =>
         bill.handleClickIconEye(icon)
       )
       iconEye.forEach((icon) => {
         icon.addEventListener("click", (e) => handleClickIconEye(icon))
         userEvent.click(icon)
       })
 
       expect(handleClickIconEye).toHaveBeenCalled()
       expect(screen.getAllByText("Justificatif")).toBeTruthy()
       })
     }) 
   })
 })
 
 
 // Integration test
 describe('Given I am a user connected as Employee', () => {
     describe('When I navigate to Bills', async () => {
 
       test("fetches bills from mock API GET", async () => {
         
         Object.defineProperty(window, 'localStorage', { value: localStorageMock })
         localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
         const root = document.createElement("div")
         root.setAttribute("id", "root")
         document.body.innerHTML = ''
         document.body.append(root)
         router()
         window.onNavigate(ROUTES_PATH.Bills)
 
         await waitFor(() => screen.getByTestId('icon-window'))
         const windowIcon = screen.getByTestId('icon-window')
         expect(windowIcon.classList.contains('active-icon')).toBe(true)
 
         await waitFor( () => screen.getByText('Mes notes de frais'))
         const title = screen.getByText('Mes notes de frais')
         expect(title).toBeDefined()
       })
 
       describe("When an error occurs on the API", () => {
 
         beforeEach(() => {
           jest.spyOn(mockStore, "bills")
           Object.defineProperty(
             window,
             'localStorage',
             { value: localStorageMock }
           )
           window.localStorage.setItem('user', JSON.stringify({
             type: 'Employee',
             email: "a@a"
           }))
 
           const root = document.createElement("div")
           root.setAttribute("id", "root")
           document.body.appendChild(root)
           router()
         })
 
       
         test("fetches bills from an API and fails with the 404 message error", async () => {
           mockStore.bills.mockImplementationOnce(() => {
             return {
               list: () => {
                 return Promise.reject(new Error("Erreur 404"))
               }
             }
           })
 
           window.onNavigate(ROUTES_PATH.Bills)
           await new Promise(process.nextTick)
           const message = await screen.getByText(/Erreur 404/)
 
           expect(message).toBeTruthy()
         })
 
       
         test("fetches messages from an API and fails with the 500 message error", async () => {
           mockStore.bills.mockImplementationOnce(() => {
             return {
               list: () => {
                 return Promise.reject(new Error("Erreur 500"))
               }
             }
           })
 
           window.onNavigate(ROUTES_PATH.Bills)
           await new Promise(process.nextTick)
           const message = await screen.getByText(/Erreur 500/)
 
           expect(message).toBeTruthy()
         })
       })
     })
 })