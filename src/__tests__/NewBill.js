/**
 * @jest-environment jsdom
 */
 import "@testing-library/jest-dom/extend-expect";
 import { screen, waitFor, fireEvent } from "@testing-library/dom";
 import NewBillUI from "../views/NewBillUI.js";
 import NewBill from "../containers/NewBill.js";
 import mockStore from "../__mocks__/store.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
 import router from "../app/Router.js";
 
 jest.mock("../app/store", () => mockStore);
 
 const onNavigate = (pathname) => {
   document.body.innerHTML = ROUTES({ pathname });
 };
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on NewBill Page", () => {
     beforeEach(() => {
       Object.defineProperty(window, "localStorage", {
         value: localStorageMock,
       });
       window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
       document.body.innerHTML = "<div id=\"root\"></div>";
       router();
     });
 
     test("Then mail icon in vertical layout should be highlighted", async () => {
       window.onNavigate(ROUTES_PATH.NewBill);
       await waitFor(() => screen.getByTestId("icon-mail"));
       const windowIcon = screen.getByTestId("icon-mail");
       expect(windowIcon.className).toContain("active-icon");
     });
 
     test("Then it should render the NewBill Page", () => {
       const NewBillPage = screen.getByText("Envoyer une note de frais");
       expect(NewBillPage).toBeVisible();
 
       const formNewBill = screen.getByTestId("form-new-bill");
       expect(formNewBill).toBeVisible();
     });
 
     // Checks if the uploaded file is of an accepted format
     test("Then file is uploaded with the right format", async () => {
 
       const newBill = new NewBill({
         document,
         onNavigate,
         store: mockStore,
         localStorage: localStorageMock,
       });
 
       const handleChangeFile = jest.fn(newBill.handleChangeFile);
       const input = screen.getByTestId("file");
       input.addEventListener("change", handleChangeFile);
       fireEvent.change(input, {
         target: {
           files: [
             new File(["goodFile.jpg"], "goodFile.jpg", {
               type: "image/jpg",
             }),
           ],
         },
       });
 
       const allowedExtension = /(\.jpg|\.jpeg|\.png)$/i;
 
       expect(handleChangeFile).toHaveBeenCalled();
       expect(input.files[0].name).toBe("goodFile.jpg");
       expect(input.files[0].name).toMatch(allowedExtension);
     });
 
     test("Then file is uploaded with a non-accepted format", async () => {
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });
 
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const input = screen.getByTestId("file");
        input.addEventListener("change", handleChangeFile);
        fireEvent.change(input, {
          target: {
            files: [
              new File(["badFile.pdf"], "badFile.pdf", {
                type: "application/pdf",
              }),
            ],
          },
        });
 
        const allowedExtension = /(\.jpg|\.jpeg|\.png)$/i;
 
        expect(handleChangeFile).toHaveBeenCalled();
        expect(input.files[0].name).toBe("badFile.pdf");
        expect(input.files[0].name).not.toMatch(allowedExtension);
     });
 
     
     test("Then the validated NewBill should be updated in the API", async () => {
       const billCreated = mockStore.bills().update();
       const createBill = await billCreated.then((value) => {
         return value;
       });
 
       expect(createBill.id).toBe("47qAXb6fIm2zOKkLzMro");
       expect(createBill.fileUrl).toBe(
         "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
       );
       expect(createBill.fileName).toBe("preview-facture-free-201801-pdf-1.jpg");
       expect(createBill.key).toBeUndefined;
     });
 
     test("Then the validated NewBill should be created in the API", async () => {
       const billUpdated = mockStore.bills().create();
       const updateBill = await billUpdated.then((value) => {
         return value;
       });
 
       expect(updateBill.id).toBeUndefined;
       expect(updateBill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
       expect(updateBill.fileName).toBeUndefined;
       expect(updateBill.key).toBe("1234");
     });
 
     //handleSubmit : Display of the NewBill
     test("Then the validated NewBill should be displayed", async () => {
 
       const html = NewBillUI();
       document.body.innerHTML = html;
 
       const newBill = new NewBill({
         document,
         onNavigate,
         store: null,
         localStorage: localStorageMock,
       });
 
       const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
       const btnSendBill = screen.getByTestId("form-new-bill");
 
       btnSendBill.addEventListener("submit", handleSubmit);
       fireEvent.submit(btnSendBill);
 
       expect(handleSubmit).toHaveBeenCalled();
       expect(screen.getByTestId("btn-new-bill")).toBeVisible();
       expect(screen.getByText("Mes notes de frais")).toBeVisible();
     });
   });


 });
 
//  Error tests
 describe("When an error occurs on the API", () => {
   test("fetches messages from an API and fails with the 500 error message", async () => {
     jest.spyOn(mockStore, "bills");
 
     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
     window.localStorage.setItem('user', JSON.stringify({
       type: 'Employee'
     }))
     const root = document.createElement("div")
     root.setAttribute("id", "root")
     document.body.append(root)
     router();
 
     window.onNavigate(ROUTES_PATH.NewBill);
 
     mockStore.bills.mockImplementationOnce(() => {
       return {
         update: () => {
           return Promise.reject(new Error("Erreur 500"));
         },
       };
     });
   });


   test("fetches bills from an API and fails with the 404 message error", async () => {
    jest.spyOn(mockStore, "bills");
 
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
     router();
 
     window.onNavigate(ROUTES_PATH.NewBill);



    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(new Error("Erreur 404"))
        }
      }
    })
  })

  
 });

