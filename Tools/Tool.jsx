import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Calculator from "../Tools/Component/Calculator.jsx";
import FarenToCelciusAndCelciusToFaren from "../Tools/Component/FarenToCelciusAndCelciusToFaren.jsx";
import Second from "../Tools/Component/Second.jsx";
import Paypal from "../Tools/Component/Paypal.jsx";
import Beautifier from "../Tools/Component/Beautifier.jsx";

import ResumeBuild from "../Tools/Component/ResumeBuild.jsx";
import Grocery from "../Tools/Component/Grocery.jsx";
import Bmi from "../Tools/Component/Bmi.jsx";
import LinkChecker from "../Tools/Component/LinkChecker.jsx";
import Percentage from "../Tools/Component/Percentage.jsx";
import ImageToPdf from "../Tools/Component/ImageToPdf.jsx";
import SplitPdf from "../Tools/Component/SplitPdf.jsx";
import NewTab from "./NewTab.jsx";
import Hours from "../Tools/Component/Hours.jsx";
import Compress from "../Tools/Component/Compress.jsx";
import MergePDF from "../Tools/Component/MergePDF.jsx";
import PdfConverter from "../Tools/Component/PdfConverter.jsx";
import SearchPDF from "../Tools/Component/SearchPDF.jsx";
//import SearchExcelPdf from '../Tools/Component/SearchExcelPdf.jsx';
import Upload from "../Tools/Component/EditableImage/Upload.jsx";
import EditPdf from "../Tools/Component/EditPdf.jsx";
import ExtractPages from "../Tools/Component/ExtractPages.jsx";
import PdfCropper from "../Tools/Component/PdfCropper.jsx";
import AddPageNum from "../Tools/Component/AddPageNum.jsx";
import Protect from "../Tools/Component/Protect.jsx";
import UnlockPdf from "../Tools/Component/UnlockPdf.jsx";
import PdfToImage from "../Tools/Component/PdfToImage.jsx";
import PdfToWord from "../Tools/Component/PdfToWord.jsx";
import Scientific from "../Tools/Component/Scientific.jsx";
import BulkEmailChecker from "../Tools/Component/BulkEmailChecker.jsx";
import BulkEmailSender from "../Tools/Component/BulkEmailSender.jsx";
import GoogleMap from "../Tools/Component/GoogleMap.jsx";
import CardValidation from "../Tools/Component/CardValidation.jsx";
import CardGenerator from "../Tools/Component/CardGenerator.jsx";
import TemplateGenerator from "../Tools/Component/TemplateGenerator.jsx";
import CompareLoan from "../Tools/Component/CompareLoan.jsx";
import CurrencyConverter from "../Tools/Component/CurrencyConverter.jsx";
import TextToSpeech from "../Tools/Component/TextToSpeech.jsx";
import SpeechToText from "../Tools/Component/SpeechToText.jsx";
import OnlineVoiceRecorder from "../Tools/Component/OnlineVoiceRecorder.jsx";
import OnlineScreenrecoder from "../Tools/Component/OnlineScreenrecoder.jsx";
import OnlineScreenshot from "../Tools/Component/OnlineScreenshot.jsx";
import OnlineWebcamTest from "../Tools/Component/OnlineWebcamTest.jsx";
import PhoneNumberFormat from "../Tools/Component/PhoneNumberFormat.jsx";
import RandomPassword from "../Tools/Component/RandomPassword.jsx";
import FractionCalculator from "../Tools/Component/FractionCalculator.jsx";
import AverageCalculator from "../Tools/Component/AverageCalculator.jsx";
import Lcm from "../Tools/Component/Lcm.jsx";
import AgeCalculator from "../Tools/Component/AgeCalculator.jsx";
import DateDiffCalculator from "../Tools/Component/DateDiffCalculator.jsx";
import LinkedinScraper from "../Tools/Component/LinkedinScraper.jsx";
import Calendar from "../Tools/Component/Calendar.jsx";
import Clock from "../Tools/Component/Clock.jsx";
import Stopwatch from "../Tools/Component/StopWatch.jsx";
import Timer from "../Tools/Component/Timer.jsx";
import Alarm from "../Tools/Component/Alarm.jsx";
import BinaryToDecimal from "../Tools/Component/BinaryToDecimal.jsx";
import WordCounter from "../Tools/Component/WordCounter.jsx";
import CompoundIntrest from "../Tools/Component/CompoundIntrest.jsx";
import SimpleInterest from "../Tools/Component/SimpleInterest.jsx";
import DiscountCalculator from "../Tools/Component/DiscountCalculator.jsx";
import GSTCalculator from "../Tools/Component/GSTCalculator.jsx";
import VATCalculator from "../Tools/Component/VATCalculator.jsx";
import ElectricityBill from "../Tools/Component/ElectricityBill.jsx";
import TestScoreCalculator from "../Tools/Component/TestScoreCalculator.jsx";
import TrafficChecker from "../Tools/Component/TrafficChecker.jsx";
function App() {
  return (
    <div className="">
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<NewTab />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route
          path="/faren-to-celcius"
          element={<FarenToCelciusAndCelciusToFaren />}
        />
        <Route path="/second" element={<Second />} />
        <Route path="/hours" element={<Hours />} />
        <Route path="/paypal" element={<Paypal />} />
        <Route path="/beautifier" element={<Beautifier />} />
        <Route path="/resumebuild" element={<ResumeBuild />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/bmi" element={<Bmi />} />
        <Route path="/linkchecker" element={<LinkChecker />} />
        <Route path="/percentage" element={<Percentage />} />
        <Route path="/imagetopdf" element={<ImageToPdf />} />
        <Route path="/splitpdf" element={<SplitPdf />} />
        <Route path="/compress" element={<Compress />} />
        <Route path="/mergepdf" element={<MergePDF />} />
        <Route path="/pdfconverter" element={<PdfConverter />} />
        <Route path="/searchpdf" element={<SearchPDF />} />
        {/* <Route path="/searchexcelpdf" element={<SearchExcelPdf />} /> */}
        <Route path="/upload" element={<Upload />} />
        <Route path="/editpdf" element={<EditPdf />} />
        <Route path="/extractpages" element={<ExtractPages />} />
        <Route path="/pdfcropper" element={<PdfCropper />} />
        <Route path="/addpagenum" element={<AddPageNum />} />
        <Route path="/protect" element={<Protect />} />
        <Route path="/unlockpdf" element={<UnlockPdf />} />
        <Route path="/pdftoimage" element={<PdfToImage />} />
        <Route path="/pdftoword" element={<PdfToWord />} />
        <Route path="/scientific" element={<Scientific />} />
        <Route path="/bulkemailchecker" element={<BulkEmailChecker />} />
        <Route path="/bulkemailsender" element={<BulkEmailSender />} />
        <Route path="/googlemap" element={<GoogleMap />} />
        <Route path="/cardvalidation" element={<CardValidation />} />
        <Route path="/cardgenerator" element={<CardGenerator />} />
        <Route path="/templategenerator" element={<TemplateGenerator />} />
        <Route path="/compareloan" element={<CompareLoan />} />
        <Route path="/currencyconverter" element={<CurrencyConverter />} />
        <Route path="/texttospeech" element={<TextToSpeech />} />
        <Route path="/speechtotext" element={<SpeechToText />} />
        <Route path="/onlinevoiceRecorder" element={<OnlineVoiceRecorder />} />
        <Route path="/onlinescreenRecorder" element={<OnlineScreenrecoder />} />
        <Route path="/onlinescreenshot" element={<OnlineScreenshot />} />
        <Route path="/onlinewebcamtest" element={<OnlineWebcamTest />} />
        <Route path="/phonenumberformat" element={<PhoneNumberFormat />} />
        <Route path="/randompassword" element={<RandomPassword />} />
        <Route path="/fractioncalculator" element={<FractionCalculator />} />
        <Route path="/averagecalculator" element={<AverageCalculator />} />
        <Route path="/lcm" element={<Lcm />} />
        <Route path="/agecalculator" element={<AgeCalculator />} />
        <Route path="/datediffcalculator" element={<DateDiffCalculator />} />
        <Route path="/linkedinscraper" element={<LinkedinScraper />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/clock" element={<Clock />} />
        <Route path="/stopwatch" element={<Stopwatch />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/alarm" element={<Alarm />} />
        <Route path="/binarytodecimal" element={<BinaryToDecimal />} />
        <Route path="/wordcounter" element={<WordCounter />} />
        <Route path="/compoundintrest" element={<CompoundIntrest />} />
        <Route path="/simpleinterest" element={<SimpleInterest />} />
        <Route path="/discountcalculator" element={<DiscountCalculator />} />
        <Route path="/gstcalculator" element={<GSTCalculator />} />
        <Route path="/vatcalculator" element={<VATCalculator />} />
        <Route path="/electricitybill" element={<ElectricityBill />} />
        <Route path="/testscorecalculator" element={<TestScoreCalculator />} />
        <Route path="/trafficchecker" element={<TrafficChecker />} />
      </Routes>
    </div>
  );
}

export default App;
