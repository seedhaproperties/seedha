// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
// } from 'react-native';
// import {
//   ChevronLeft,
//   CheckCircle2,
//   TrendingUp,
//   Building2,
//   ChevronRight,
//   Calculator,
//   FileText,
//   Phone,
//   MessageCircle,
//   ShieldCheck,
//   Check,
//   ArrowRight,
//   Landmark,
// } from 'lucide-react-native';
// import { useApp } from '../../context/AppContext';
// import colors from '../../theme/colors';

// type Step = 'loanType' | 'calculator' | 'eligibility' | 'compare' | 'documents' | 'contactAdvisor';

// const loanTypes = [
//   { id: 'purchase', title: 'New Home Purchase Loan', sub: 'For buying flats, villas or ready homes', rate: '8.35%' },
//   { id: 'construction', title: 'Home Construction / Renovation', sub: 'Build your dream home on owned land', rate: '8.45%' },
//   { id: 'transfer', title: 'Balance Transfer / Refinance', sub: 'Switch your existing loan to lower EMI', rate: '8.40%' },
//   { id: 'lap', title: 'Loan Against Property (LAP)', sub: 'Unlock funds against your residential property', rate: '9.20%' },
//   { id: 'commercial', title: 'Commercial Property Loan', sub: 'Financing for office and retail spaces', rate: '9.50%' },
// ];

// const bankOffers = [
//   { bank: 'SBI Home Loans', rate: '8.40%', emi: '₹43,000', max: '₹1.5 Cr', fee: '₹2,000 flat', badge: 'Lowest Rate' },
//   { bank: 'HDFC Bank', rate: '8.50%', emi: '₹43,450', max: '₹1.2 Cr', fee: '0.25% of loan', badge: 'Fast Sanction' },
//   { bank: 'ICICI Bank', rate: '8.60%', emi: '₹43,900', max: '₹1.0 Cr', fee: '0.50% of loan', badge: 'Pre-Approved' },
//   { bank: 'Axis Bank', rate: '8.75%', emi: '₹44,500', max: '₹90 Lakh', fee: '₹5,000 flat', badge: 'Special Salaried' },
//   { bank: 'LIC Housing Finance', rate: '8.35%', emi: '₹42,800', max: '₹80 Lakh', fee: 'Nil for 30L', badge: 'Government Backed' },
// ];

// export default function HomeLoanScreen() {
//   const { pop, setTab, addAdminRequest } = useApp();
//   const [step, setStep] = useState<Step>('loanType');
//   const [selectedLoanType, setSelectedLoanType] = useState('purchase');

//   // EMI Calculator State
//   const [amount, setAmount] = useState('5000000');
//   const [rate, setRate] = useState('8.5');
//   const [tenureYears, setTenureYears] = useState('20');

//   // Eligibility Checker State
//   const [monthlyIncome, setMonthlyIncome] = useState('95000');
//   const [existingEmi, setExistingEmi] = useState('10000');
//   const [employmentType, setEmploymentType] = useState<'salaried' | 'self_employed'>('salaried');

//   // Selected Bank
//   const [selectedBank, setSelectedBank] = useState('SBI Home Loans');

//   // Calculations
//   const P = parseFloat(amount) || 5000000;
//   const r = (parseFloat(rate) || 8.5) / (12 * 100);
//   const n = (parseInt(tenureYears) || 20) * 12;
//   const monthlyEmi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) || 0;
//   const totalPayment = monthlyEmi * n;
//   const totalInterest = totalPayment - P;

//   // Eligibility calculation (approx 55% FOIR)
//   const income = parseFloat(monthlyIncome) || 95000;
//   const emiObligation = parseFloat(existingEmi) || 10000;
//   const maxAvailableEmi = Math.max(0, income * 0.55 - emiObligation);
//   const eligibleAmount = Math.round((maxAvailableEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))) || 0;

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => {
//             if (step === 'loanType') pop();
//             else if (step === 'calculator') setStep('loanType');
//             else if (step === 'eligibility') setStep('calculator');
//             else if (step === 'compare') setStep('eligibility');
//             else if (step === 'documents') setStep('compare');
//             else if (step === 'contactAdvisor') setStep('documents');
//           }}
//           style={styles.backCircle}
//           activeOpacity={0.8}
//         >
//           <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleCol}>
//           <Text style={styles.headerTitle}>Home Loans</Text>
//           <Text style={styles.headerSub}>
//             {step === 'loanType'
//               ? 'Select Loan Type'
//               : step === 'calculator'
//               ? 'EMI Calculator'
//               : step === 'eligibility'
//               ? 'Eligibility Checker'
//               : step === 'compare'
//               ? 'Compare Bank Loans'
//               : step === 'documents'
//               ? 'Required Documents'
//               : 'Loan Assistance Provider'}
//           </Text>
//         </View>
//       </View>

//       <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
//         {/* Step 1: User Selects Loan Type */}
//         {step === 'loanType' && (
//           <View style={styles.contentPadding}>
//             <View style={styles.heroCard}>
//               <View style={styles.badgeRow}>
//                 <Landmark size={16} color={colors.primary} />
//                 <Text style={styles.badgeText}>LOWEST INTEREST GUARANTEE</Text>
//               </View>
//               <Text style={styles.heroTitle}>Select Your Loan Type</Text>
//               <Text style={styles.heroSub}>
//                 Get pre-approved rates starting from 8.35% with zero processing fee offers from India's top lenders.
//               </Text>
//             </View>

//             <View style={styles.loanTypeList}>
//               {loanTypes.map(item => {
//                 const isSelected = selectedLoanType === item.id;
//                 return (
//                   <TouchableOpacity
//                     key={item.id}
//                     onPress={() => setSelectedLoanType(item.id)}
//                     style={[styles.loanTypeCard, isSelected && styles.loanTypeCardActive]}
//                     activeOpacity={0.85}
//                   >
//                     <View style={styles.loanTypeHeader}>
//                       <Text style={[styles.loanTypeTitle, isSelected && { color: colors.primary }]}>
//                         {item.title}
//                       </Text>
//                       <View style={[styles.rateBadge, isSelected && { backgroundColor: colors.primary }]}>
//                         <Text style={[styles.rateBadgeText, isSelected && { color: colors.textWhite }]}>
//                           from {item.rate}
//                         </Text>
//                       </View>
//                     </View>
//                     <Text style={styles.loanTypeSub}>{item.sub}</Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>

//             <TouchableOpacity
//               onPress={() => setStep('calculator')}
//               style={styles.primaryButton}
//               activeOpacity={0.9}
//             >
//               <Text style={styles.primaryButtonText}>Continue to EMI Calculator</Text>
//               <ArrowRight size={18} color={colors.textWhite} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Step 2: EMI Calculator */}
//         {step === 'calculator' && (
//           <View style={styles.contentPadding}>
//             <View style={styles.stepBadge}>
//               <Text style={styles.stepBadgeText}>Step 2 of 6: Calculate Monthly EMI</Text>
//             </View>

//             <View style={styles.emiHighlightCard}>
//               <Text style={styles.emiHighlightLabel}>Estimated Monthly EMI</Text>
//               <Text style={styles.emiHighlightValue}>₹{monthlyEmi.toLocaleString('en-IN')}</Text>
//               <View style={styles.emiMetaRow}>
//                 <View style={styles.emiMetaItem}>
//                   <Text style={styles.emiMetaKey}>Principal Loan</Text>
//                   <Text style={styles.emiMetaVal}>₹{P.toLocaleString('en-IN')}</Text>
//                 </View>
//                 <View style={styles.emiMetaItem}>
//                   <Text style={styles.emiMetaKey}>Total Interest</Text>
//                   <Text style={styles.emiMetaVal}>₹{Math.max(0, totalInterest).toLocaleString('en-IN')}</Text>
//                 </View>
//               </View>
//             </View>

//             <View style={styles.calcField}>
//               <Text style={styles.inputLabel}>Loan Amount (₹)</Text>
//               <TextInput
//                 style={styles.textInput}
//                 keyboardType="numeric"
//                 value={amount}
//                 onChangeText={setAmount}
//               />
//               <View style={styles.quickChipRow}>
//                 {['3000000', '5000000', '7500000', '10000000'].map(val => (
//                   <TouchableOpacity
//                     key={val}
//                     onPress={() => setAmount(val)}
//                     style={[styles.quickChip, amount === val && styles.quickChipActive]}
//                   >
//                     <Text style={[styles.quickChipText, amount === val && styles.quickChipTextActive]}>
//                       ₹{(parseInt(val) / 100000).toFixed(0)} Lakh
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <View style={styles.calcField}>
//               <Text style={styles.inputLabel}>Interest Rate (% p.a.)</Text>
//               <TextInput
//                 style={styles.textInput}
//                 keyboardType="numeric"
//                 value={rate}
//                 onChangeText={setRate}
//               />
//             </View>

//             <View style={styles.calcField}>
//               <Text style={styles.inputLabel}>Loan Tenure (Years)</Text>
//               <View style={styles.chipRow}>
//                 {['10', '15', '20', '25', '30'].map(y => (
//                   <TouchableOpacity
//                     key={y}
//                     onPress={() => setTenureYears(y)}
//                     style={[styles.tenureChip, tenureYears === y && styles.tenureChipActive]}
//                   >
//                     <Text style={[styles.tenureChipText, tenureYears === y && styles.tenureChipTextActive]}>
//                       {y} Yrs
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={() => setStep('eligibility')}
//               style={styles.primaryButton}
//               activeOpacity={0.9}
//             >
//               <Text style={styles.primaryButtonText}>Check Eligibility</Text>
//               <ArrowRight size={18} color={colors.textWhite} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Step 3: Eligibility Checker */}
//         {step === 'eligibility' && (
//           <View style={styles.contentPadding}>
//             <View style={styles.stepBadge}>
//               <Text style={styles.stepBadgeText}>Step 3 of 6: Check Your Loan Eligibility</Text>
//             </View>

//             <View style={styles.eligibilityResultCard}>
//               <CheckCircle2 size={32} color={colors.secondary} />
//               <Text style={styles.eligibilityCongrats}>Congratulations!</Text>
//               <Text style={styles.eligibilitySub}>Based on your income, you are eligible for up to:</Text>
//               <Text style={styles.eligibilityAmount}>₹{eligibleAmount.toLocaleString('en-IN')}</Text>
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.inputLabel}>Employment Type</Text>
//               <View style={styles.toggleRow}>
//                 <TouchableOpacity
//                   onPress={() => setEmploymentType('salaried')}
//                   style={[styles.toggleBtn, employmentType === 'salaried' && styles.toggleBtnActive]}
//                 >
//                   <Text style={[styles.toggleText, employmentType === 'salaried' && styles.toggleTextActive]}>
//                     Salaried Employee
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => setEmploymentType('self_employed')}
//                   style={[styles.toggleBtn, employmentType === 'self_employed' && styles.toggleBtnActive]}
//                 >
//                   <Text style={[styles.toggleText, employmentType === 'self_employed' && styles.toggleTextActive]}>
//                     Self-Employed / Business
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.inputLabel}>Monthly Net Salary / Income (₹)</Text>
//               <TextInput
//                 style={styles.textInput}
//                 keyboardType="numeric"
//                 value={monthlyIncome}
//                 onChangeText={setMonthlyIncome}
//               />
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.inputLabel}>Existing Monthly EMIs / Loans (₹)</Text>
//               <TextInput
//                 style={styles.textInput}
//                 keyboardType="numeric"
//                 value={existingEmi}
//                 onChangeText={setExistingEmi}
//               />
//             </View>

//             <TouchableOpacity
//               onPress={() => setStep('compare')}
//               style={styles.primaryButton}
//               activeOpacity={0.9}
//             >
//               <Text style={styles.primaryButtonText}>Compare Bank Loans</Text>
//               <ArrowRight size={18} color={colors.textWhite} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Step 4: Compare Bank Loans */}
//         {step === 'compare' && (
//           <View style={styles.contentPadding}>
//             <View style={styles.stepBadge}>
//               <Text style={styles.stepBadgeText}>Step 4 of 6: Compare Bank Offers</Text>
//             </View>

//             <Text style={styles.sectionHeading}>Top Banking Partners</Text>

//             <View style={styles.banksList}>
//               {bankOffers.map(b => {
//                 const isSelected = selectedBank === b.bank;
//                 return (
//                   <TouchableOpacity
//                     key={b.bank}
//                     onPress={() => setSelectedBank(b.bank)}
//                     style={[styles.bankCard, isSelected && styles.bankCardActive]}
//                     activeOpacity={0.85}
//                   >
//                     <View style={styles.bankTopRow}>
//                       <View style={{ flex: 1 }}>
//                         <Text style={styles.bankName}>{b.bank}</Text>
//                         <View style={styles.bankTag}>
//                           <Text style={styles.bankTagText}>{b.badge}</Text>
//                         </View>
//                       </View>
//                       <View style={styles.bankRateCol}>
//                         <Text style={styles.bankRateText}>{b.rate}</Text>
//                         <Text style={styles.bankRateSub}>Interest Rate</Text>
//                       </View>
//                     </View>

//                     <View style={styles.bankDetailsRow}>
//                       <View style={styles.bankDetailItem}>
//                         <Text style={styles.bankDetailKey}>Monthly EMI</Text>
//                         <Text style={styles.bankDetailVal}>{b.emi}</Text>
//                       </View>
//                       <View style={styles.bankDetailItem}>
//                         <Text style={styles.bankDetailKey}>Max Loan</Text>
//                         <Text style={styles.bankDetailVal}>{b.max}</Text>
//                       </View>
//                       <View style={styles.bankDetailItem}>
//                         <Text style={styles.bankDetailKey}>Processing Fee</Text>
//                         <Text style={styles.bankDetailVal}>{b.fee}</Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>

//             <TouchableOpacity
//               onPress={() => setStep('documents')}
//               style={styles.primaryButton}
//               activeOpacity={0.9}
//             >
//               <Text style={styles.primaryButtonText}>Select {selectedBank} & Show Documents</Text>
//               <ArrowRight size={18} color={colors.textWhite} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Step 5: Show Required Documents */}
//         {step === 'documents' && (
//           <View style={styles.contentPadding}>
//             <View style={styles.stepBadge}>
//               <Text style={styles.stepBadgeText}>Step 5 of 6: Required Documents</Text>
//             </View>

//             <View style={styles.docChecklistCard}>
//               <Text style={styles.docChecklistTitle}>Document Checklist for {selectedBank}</Text>
//               <Text style={styles.docChecklistSub}>Keep soft copies or originals ready for doorstep pickup.</Text>

//               <View style={styles.docCategory}>
//                 <Text style={styles.docCategoryTitle}>1. Identity & Residence Proof</Text>
//                 <View style={styles.docItem}>
//                   <Check size={14} color={colors.secondary} strokeWidth={3} />
//                   <Text style={styles.docItemText}>Aadhaar Card & PAN Card</Text>
//                 </View>
//                 <View style={styles.docItem}>
//                   <Check size={14} color={colors.secondary} strokeWidth={3} />
//                   <Text style={styles.docItemText}>Passport or Voter ID or Driving License</Text>
//                 </View>
//               </View>

//               <View style={styles.docCategory}>
//                 <Text style={styles.docCategoryTitle}>2. Income Proof</Text>
//                 <View style={styles.docItem}>
//                   <Check size={14} color={colors.secondary} strokeWidth={3} />
//                   <Text style={styles.docItemText}>Last 3 Months Salary Slips</Text>
//                 </View>
//                 <View style={styles.docItem}>
//                   <Check size={14} color={colors.secondary} strokeWidth={3} />
//                   <Text style={styles.docItemText}>Form 16 / ITR Returns for last 2 years</Text>
//                 </View>
//               </View>

//               <View style={styles.docCategory}>
//                 <Text style={styles.docCategoryTitle}>3. Banking & Property</Text>
//                 <View style={styles.docItem}>
//                   <Check size={14} color={colors.secondary} strokeWidth={3} />
//                   <Text style={styles.docItemText}>Last 6 Months Salary Account Bank Statement</Text>
//                 </View>
//                 <View style={styles.docItem}>
//                   <Check size={14} color={colors.secondary} strokeWidth={3} />
//                   <Text style={styles.docItemText}>Property Allotment Letter or Agreement of Sale</Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={() => {
//                 if (addAdminRequest) {
//                   addAdminRequest({
//                     category: 'home_loan',
//                     title: `Home Loan Application: ${selectedBank}`,
//                     userName: 'Rahul Sharma',
//                     userPhone: '+91 98765 43210',
//                     userEmail: 'rahul@email.com',
//                     location: 'Madhapur, Hyderabad',
//                     amount: `₹${(parseFloat(amount) / 100000).toFixed(1)} Lakhs`,
//                     details: {
//                       bank: selectedBank,
//                       loanType: selectedLoanType,
//                       monthlyIncome: `₹${monthlyIncome}`,
//                       interestRate: `${rate}%`,
//                       tenure: `${tenureYears} Years`,
//                       calculatedEMI: `₹${monthlyEmi.toLocaleString('en-IN')}`,
//                     },
//                   });
//                 }
//                 setStep('contactAdvisor');
//               }}
//               style={styles.primaryButton}
//               activeOpacity={0.9}
//             >
//               <Text style={styles.primaryButtonText}>Contact Loan Assistance Provider</Text>
//               <ArrowRight size={18} color={colors.textWhite} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Step 6: Contact Loan Assistance Provider */}
//         {step === 'contactAdvisor' && (
//           <View style={styles.contentPadding}>
//             <View style={styles.successIconCircle}>
//               <CheckCircle2 size={44} color={colors.secondary} />
//             </View>
//             <Text style={styles.successTitle}>Loan Assistance Assigned!</Text>
//             <Text style={styles.successSub}>
//               A dedicated loan specialist from Seedha Financial Services has been assigned to your {selectedBank} application.
//             </Text>

//             {/* Advisor Card */}
//             <View style={styles.advisorCard}>
//               <View style={styles.advisorHeader}>
//                 <View style={styles.advisorAvatar}>
//                   <Text style={styles.advisorAvatarText}>PS</Text>
//                 </View>
//                 <View style={styles.advisorInfo}>
//                   <Text style={styles.advisorName}>Priya Sharma</Text>
//                   <Text style={styles.advisorTitle}>Senior Home Loan Advisor</Text>
//                   <Text style={styles.advisorExperience}>⭐ 4.9 · 1,400+ loans successfully disbursed</Text>
//                 </View>
//               </View>

//               <View style={styles.advisorPerks}>
//                 <View style={styles.perkRow}>
//                   <CheckCircle2 size={14} color={colors.secondary} />
//                   <Text style={styles.perkText}>Doorstep document pickup within 24 hours</Text>
//                 </View>
//                 <View style={styles.perkRow}>
//                   <CheckCircle2 size={14} color={colors.secondary} />
//                   <Text style={styles.perkText}>Direct bank negotiation for lowest processing fees</Text>
//                 </View>
//               </View>

//               <View style={styles.advisorActionBtns}>
//                 <TouchableOpacity style={styles.callAdvisorBtn} activeOpacity={0.8}>
//                   <Phone size={16} color={colors.primary} />
//                   <Text style={styles.callAdvisorBtnText}>Call Priya Sharma</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.whatsappAdvisorBtn} activeOpacity={0.8}>
//                   <MessageCircle size={16} color={colors.textWhite} />
//                   <Text style={styles.whatsappAdvisorBtnText}>WhatsApp</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={() => setTab('home')}
//               style={styles.primaryButton}
//               activeOpacity={0.9}
//             >
//               <Text style={styles.primaryButtonText}>Return to Home</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 14,
//     paddingBottom: 12,
//     backgroundColor: colors.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderLight,
//   },
//   backCircle: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: colors.tertiaryBg,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitleCol: {
//     marginLeft: 12,
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: colors.primary,
//   },
//   headerSub: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: 1,
//   },
//   scrollArea: {
//     flex: 1,
//   },
//   contentPadding: {
//     padding: 16,
//   },
//   heroCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: 16,
//   },
//   badgeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: colors.tertiaryBg,
//     alignSelf: 'flex-start',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   badgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: colors.primary,
//   },
//   heroTitle: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: colors.primary,
//     marginBottom: 6,
//   },
//   heroSub: {
//     fontSize: 13,
//     color: colors.textSecondary,
//     lineHeight: 18,
//   },
//   loanTypeList: {
//     gap: 10,
//     marginBottom: 20,
//   },
//   loanTypeCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1.5,
//     borderColor: colors.border,
//   },
//   loanTypeCardActive: {
//     borderColor: colors.primary,
//     backgroundColor: colors.surface,
//   },
//   loanTypeHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   loanTypeTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: colors.primary,
//     flex: 1,
//   },
//   rateBadge: {
//     backgroundColor: colors.secondaryBg,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 6,
//   },
//   rateBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: colors.secondary,
//   },
//   loanTypeSub: {
//     fontSize: 12,
//     color: colors.textSecondary,
//   },
//   stepBadge: {
//     backgroundColor: colors.secondaryBg,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//     marginBottom: 16,
//   },
//   stepBadgeText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: colors.secondary,
//   },
//   emiHighlightCard: {
//     backgroundColor: colors.primary,
//     borderRadius: 16,
//     padding: 18,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   emiHighlightLabel: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.7)',
//     fontWeight: '600',
//   },
//   emiHighlightValue: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: colors.textWhite,
//     marginVertical: 4,
//   },
//   emiMetaRow: {
//     flexDirection: 'row',
//     width: '100%',
//     justifyContent: 'space-around',
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255,255,255,0.15)',
//     paddingTop: 10,
//     marginTop: 6,
//   },
//   emiMetaItem: {
//     alignItems: 'center',
//   },
//   emiMetaKey: {
//     fontSize: 11,
//     color: 'rgba(255,255,255,0.7)',
//   },
//   emiMetaVal: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: colors.textWhite,
//     marginTop: 2,
//   },
//   formGroup: {
//     marginBottom: 14,
//   },
//   calcField: {
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: colors.primary,
//     marginBottom: 6,
//   },
//   textInput: {
//     backgroundColor: colors.surface,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: colors.border,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 15,
//     fontWeight: '600',
//     color: colors.primary,
//   },
//   quickChipRow: {
//     flexDirection: 'row',
//     gap: 8,
//     marginTop: 8,
//   },
//   quickChip: {
//     flex: 1,
//     paddingVertical: 6,
//     borderRadius: 8,
//     backgroundColor: colors.surfaceSoft,
//     borderWidth: 1,
//     borderColor: colors.border,
//     alignItems: 'center',
//   },
//   quickChipActive: {
//     backgroundColor: colors.tertiaryBg,
//     borderColor: colors.primary,
//   },
//   quickChipText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: colors.textSecondary,
//   },
//   quickChipTextActive: {
//     color: colors.primary,
//     fontWeight: '700',
//   },
//   chipRow: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   tenureChip: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: colors.surface,
//     borderWidth: 1,
//     borderColor: colors.border,
//     alignItems: 'center',
//   },
//   tenureChipActive: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   tenureChipText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: colors.textSecondary,
//   },
//   tenureChipTextActive: {
//     color: colors.textWhite,
//     fontWeight: '700',
//   },
//   eligibilityResultCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 16,
//     padding: 18,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.secondary,
//     marginBottom: 16,
//   },
//   eligibilityCongrats: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: colors.primary,
//     marginTop: 8,
//   },
//   eligibilitySub: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: 2,
//   },
//   eligibilityAmount: {
//     fontSize: 26,
//     fontWeight: '800',
//     color: colors.secondary,
//     marginTop: 6,
//   },
//   toggleRow: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: colors.surface,
//     borderWidth: 1.5,
//     borderColor: colors.border,
//     alignItems: 'center',
//   },
//   toggleBtnActive: {
//     borderColor: colors.primary,
//     backgroundColor: colors.primaryBg,
//   },
//   toggleText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: colors.textSecondary,
//   },
//   toggleTextActive: {
//     color: colors.primary,
//     fontWeight: '700',
//   },
//   sectionHeading: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: colors.primary,
//     marginBottom: 12,
//   },
//   banksList: {
//     gap: 10,
//     marginBottom: 20,
//   },
//   bankCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1.5,
//     borderColor: colors.border,
//   },
//   bankCardActive: {
//     borderColor: colors.primary,
//     backgroundColor: colors.surface,
//   },
//   bankTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   bankName: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: colors.primary,
//   },
//   bankTag: {
//     alignSelf: 'flex-start',
//     backgroundColor: colors.secondaryBg,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     marginTop: 3,
//   },
//   bankTagText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: colors.secondary,
//   },
//   bankRateCol: {
//     alignItems: 'flex-end',
//   },
//   bankRateText: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: colors.primary,
//   },
//   bankRateSub: {
//     fontSize: 10,
//     color: colors.textMuted,
//   },
//   bankDetailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: colors.borderLight,
//     paddingTop: 8,
//   },
//   bankDetailItem: {
//     alignItems: 'center',
//   },
//   bankDetailKey: {
//     fontSize: 10,
//     color: colors.textMuted,
//   },
//   bankDetailVal: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: colors.primary,
//     marginTop: 2,
//   },
//   docChecklistCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: 20,
//   },
//   docChecklistTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: colors.primary,
//   },
//   docChecklistSub: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: 2,
//     marginBottom: 14,
//   },
//   docCategory: {
//     marginBottom: 12,
//   },
//   docCategoryTitle: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: colors.primary,
//     marginBottom: 6,
//   },
//   docItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     paddingVertical: 3,
//   },
//   docItemText: {
//     fontSize: 12,
//     color: colors.textPrimary,
//   },
//   successIconCircle: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: colors.secondaryBg,
//     alignItems: 'center',
//     justifyContent: 'center',
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   successTitle: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: colors.primary,
//     textAlign: 'center',
//   },
//   successSub: {
//     fontSize: 13,
//     color: colors.textSecondary,
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 18,
//   },
//   advisorCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: 20,
//   },
//   advisorHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   advisorAvatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: colors.secondary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   advisorAvatarText: {
//     color: colors.textWhite,
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   advisorInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   advisorName: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: colors.primary,
//   },
//   advisorTitle: {
//     fontSize: 12,
//     color: colors.secondary,
//     fontWeight: '600',
//   },
//   advisorExperience: {
//     fontSize: 11,
//     color: colors.textMuted,
//     marginTop: 2,
//   },
//   advisorPerks: {
//     gap: 6,
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: colors.borderLight,
//     marginBottom: 14,
//   },
//   perkRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   perkText: {
//     fontSize: 12,
//     color: colors.textPrimary,
//   },
//   advisorActionBtns: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   callAdvisorBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: colors.primary,
//     gap: 6,
//   },
//   callAdvisorBtnText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: colors.primary,
//   },
//   whatsappAdvisorBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: colors.secondary,
//     gap: 6,
//   },
//   whatsappAdvisorBtnText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: colors.textWhite,
//   },
//   primaryButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 14,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 20,
//   },
//   primaryButtonText: {
//     color: colors.textWhite,
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  PanResponder,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  TrendingUp,
  Building2,
  Landmark,
  Building,
  Home,
  Percent,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { api } from '../../services/api';

type Step = 'landing' | 'basic' | 'income' | 'results' | 'lenders' | 'apply';

const lenders = [
  {
    name: 'SBI Home Loans',
    rate: '8.40%',
    emi: '₹43,000/mo',
    maxLoan: '1.5 Cr',
    badge: 'Lowest Rate',
    iconType: 'sbi',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
  },
  {
    name: 'HDFC Bank',
    rate: '8.50%',
    emi: '₹43,450/mo',
    maxLoan: '1.2 Cr',
    badge: null,
    iconType: 'hdfc',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    name: 'ICICI Bank',
    rate: '8.60%',
    emi: '₹43,900/mo',
    maxLoan: '1.0 Cr',
    badge: null,
    iconType: 'icici',
    iconBg: '#F1F5F9',
    iconColor: '#475569',
  },
  {
    name: 'Axis Bank',
    rate: '8.75%',
    emi: '₹44,500/mo',
    maxLoan: '90 L',
    badge: null,
    iconType: 'axis',
    iconBg: '#FEF9C3',
    iconColor: '#CA8A04',
  },
  {
    name: 'LIC HFL',
    rate: '8.35%',
    emi: '₹42,800/mo',
    maxLoan: '80 L',
    badge: null,
    iconType: 'lic',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
];

interface SliderProps {
  label: string;
  valueText: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

const CustomSlider: React.FC<SliderProps> = ({
  label,
  valueText,
  value,
  min,
  max,
  step = 1,
  onChange,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<React.ElementRef<typeof View>>(null);
  const trackLayoutRef = useRef<{ pageX: number; width: number }>({ pageX: 0, width: 0 });

  // Keep track of latest props & state in refs for PanResponder callbacks
  const latestProps = useRef({ min, max, step, onChange, value });
  latestProps.current = { min, max, step, onChange, value };

  const currentRatio = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handlePositionChange = (clientX: number) => {
    const { pageX, width } = trackLayoutRef.current;
    const w = width > 0 ? width : trackWidth;
    if (w <= 0) return;

    const offsetX = clientX - pageX;
    const ratio = Math.max(0, Math.min(1, offsetX / w));
    const { min: curMin, max: curMax, step: curStep, onChange: curOnChange } = latestProps.current;
    let rawVal = curMin + ratio * (curMax - curMin);
    if (curStep > 0) {
      rawVal = Math.round((rawVal - curMin) / curStep) * curStep + curMin;
    }
    const clamped = Math.max(curMin, Math.min(curMax, rawVal));
    curOnChange(clamped);
  };

  const measureTrack = useCallback(() => {
    if (trackRef.current && typeof trackRef.current.measure === 'function') {
      trackRef.current.measure((_x: number, _y: number, width: number, _height: number, pageX: number) => {
        if (width > 0) {
          trackLayoutRef.current = { pageX, width };
          setTrackWidth(width);
        }
      });
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        measureTrack();
        if (evt.nativeEvent.pageX !== undefined && trackLayoutRef.current.pageX > 0) {
          handlePositionChange(evt.nativeEvent.pageX);
        } else if (evt.nativeEvent.locationX !== undefined && trackWidth > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidth));
          const { min: curMin, max: curMax, step: curStep, onChange: curOnChange } = latestProps.current;
          let rawVal = curMin + ratio * (curMax - curMin);
          if (curStep > 0) rawVal = Math.round((rawVal - curMin) / curStep) * curStep + curMin;
          curOnChange(Math.max(curMin, Math.min(curMax, rawVal)));
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.pageX !== undefined && trackLayoutRef.current.pageX > 0) {
          handlePositionChange(evt.nativeEvent.pageX);
        } else if (evt.nativeEvent.locationX !== undefined && trackWidth > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidth));
          const { min: curMin, max: curMax, step: curStep, onChange: curOnChange } = latestProps.current;
          let rawVal = curMin + ratio * (curMax - curMin);
          if (curStep > 0) rawVal = Math.round((rawVal - curMin) / curStep) * curStep + curMin;
          curOnChange(Math.max(curMin, Math.min(curMax, rawVal)));
        }
      },
      onPanResponderRelease: (evt) => {
        if (evt.nativeEvent.pageX !== undefined && trackLayoutRef.current.pageX > 0) {
          handlePositionChange(evt.nativeEvent.pageX);
        }
      },
    })
  ).current;

  // Web input slider support for smooth mouse dragging & accessibility on React Native Web
  if (Platform.OS === 'web') {
    return (
      <View style={sliderStyles.rowContainer}>
        <View style={sliderStyles.topRow}>
          <Text style={sliderStyles.label}>{label}</Text>
          <Text style={sliderStyles.valueText}>{valueText}</Text>
        </View>
        <View style={sliderStyles.webSliderWrapper}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e: any) => onChange(Number(e.target.value))}
            style={{
              width: '100%',
              height: 24,
              cursor: 'pointer',
              accentColor: '#000000',
              background: 'transparent',
              outline: 'none',
              margin: 0,
            } as any}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={sliderStyles.rowContainer}>
      <View style={sliderStyles.topRow}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={sliderStyles.valueText}>{valueText}</Text>
      </View>
      <View
        ref={trackRef}
        style={sliderStyles.touchableArea}
        onLayout={() => measureTrack()}
        {...panResponder.panHandlers}
      >
        <View style={sliderStyles.trackBackground}>
          <View
            style={[
              sliderStyles.trackActive,
              { width: `${Math.round(currentRatio * 100)}%` },
            ]}
          />
        </View>
        <View
          style={[
            sliderStyles.thumb,
            {
              left: `${Math.round(currentRatio * 100)}%`,
              marginLeft: -7,
            },
          ]}
        />
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  rowContainer: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  webSliderWrapper: {
    height: 24,
    justifyContent: 'center',
  },
  touchableArea: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  trackActive: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: 9,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default function HomeLoanScreen() {
  const { pop } = useApp();
  const [step, setStep] = useState<Step>('landing');

  // Slider interactive states
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // 50 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 Years

  const [form, setForm] = useState({
    name: '',
    phone: '',
    employment: 'Salaried', // 'Salaried' | 'Self-Employed' | 'Business'
    income: '',
    existingEmis: '',
    loanAmount: '50,00,000',
    propertyValue: '70,00,000',
    downPayment: '20,00,000',
    tenure: '20yr', // '10yr' | '15yr' | '20yr' | '25yr' | '30yr'
    panCard: '',
    aadhaarNumber: '',
    propertyAddress: '',
    selectedBank: 'SBI Home Loans',
  });
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // Dynamic Bank Offers from Backend
  const [bankOffers, setBankOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [comparisonHighlights, setComparisonHighlights] = useState<any>(null);
  const [selectedBankOffer, setSelectedBankOffer] = useState<any>(null);

  const fetchBankOffers = useCallback(async (amount: number, tenure: number) => {
    setOffersLoading(true);
    try {
      const res = await api.homeLoans.compareBanks({
        loanAmount: amount,
        tenureYears: tenure,
      });
      const offersList = res?.offers || res?.banks || [];
      if (Array.isArray(offersList) && offersList.length > 0) {
        setBankOffers(offersList);
        setComparisonHighlights(res.comparisonHighlights || null);
      } else {
        setBankOffers(lenders);
      }
    } catch (err: any) {
      console.warn('[HomeLoanScreen] Bank comparison fetch notice:', err?.message || err);
      setBankOffers(lenders);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankOffers(loanAmount, tenureYears);
  }, [loanAmount, tenureYears, fetchBankOffers]);

  // Formatting helpers
  const formatIndianCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const calculateMonthlyEMI = (principal: number, annualRate: number, years: number) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    const r = annualRate / 12 / 100;
    const n = years * 12;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const currentEmi = calculateMonthlyEMI(loanAmount, interestRate, tenureYears);

  const handleBackNavigation = () => {
    if (step === 'landing') {
      pop();
    } else if (step === 'basic') {
      setStep('landing');
    } else if (step === 'income') {
      setStep('basic');
    } else if (step === 'results') {
      setStep('income');
    } else if (step === 'lenders') {
      setStep('results');
    } else if (step === 'apply') {
      setStep('lenders');
    } else {
      setStep('landing');
    }
  };

  const renderLenderIcon = (type: string, color: string) => {
    switch (type) {
      case 'sbi':
        return <Landmark size={22} color={color} strokeWidth={2.2} />;
      case 'hdfc':
        return <Building size={22} color={color} strokeWidth={2.2} />;
      case 'icici':
        return <Building2 size={22} color={color} strokeWidth={2.2} />;
      case 'axis':
        return <Percent size={22} color={color} strokeWidth={2.2} />;
      case 'lic':
        return <Home size={22} color={color} strokeWidth={2.2} />;
      default:
        return <Building2 size={22} color={color} strokeWidth={2.2} />;
    }
  };

  if (applied) {
    const displayLoanAmount = form.loanAmount ? `₹${form.loanAmount}` : '₹50,00,000';
    const displayTenure = form.tenure
      ? `${form.tenure.replace('yr', '')} Years`
      : '20 Years';
    const displayEmi = '₹43,391/mo';

    return (
      <View style={styles.successScreenContainer}>
        {/* Soft Green Circle with Checkmark Icon */}
        <View style={styles.successCircleOuter}>
          <View style={styles.successCircleInner}>
            <Check size={26} color="#16A34A" strokeWidth={3} />
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.successMainTitle}>Application Submitted!</Text>
        <Text style={styles.successMainSub}>
          Our loan advisor will contact you within 2 hours{'\n'}to guide you through the next steps.
        </Text>

        {/* Loan Details Summary Card */}
        <View style={styles.successDetailsCard}>
          <View style={styles.successDetailRow}>
            <Text style={styles.successDetailLabel}>Loan Amount</Text>
            <Text style={styles.successDetailValue}>{displayLoanAmount}</Text>
          </View>

          <View style={styles.successDetailRow}>
            <Text style={styles.successDetailLabel}>Tenure</Text>
            <Text style={styles.successDetailValue}>{displayTenure}</Text>
          </View>

          <View style={styles.successDetailRow}>
            <Text style={styles.successDetailLabel}>Est. EMI</Text>
            <Text style={styles.successDetailValue}>{displayEmi}</Text>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          onPress={pop}
          style={styles.backHomeButtonFigma}
          activeOpacity={0.88}
        >
          <Text style={styles.backHomeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackNavigation}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {step === 'basic' || step === 'income' || step === 'results'
              ? 'Check Eligibility'
              : step === 'apply'
                ? 'Home Loan Application'
                : 'Home Loan'}
          </Text>
          {step === 'basic' && (
            <Text style={styles.headerSubtitle}>Basic Details</Text>
          )}
          {step === 'income' && (
            <Text style={styles.headerSubtitle}>Income Details</Text>
          )}
          {step === 'results' && (
            <Text style={styles.headerSubtitle}>Results Details</Text>
          )}
          {step === 'lenders' && (
            <Text style={styles.headerSubtitle}>Lenders Details</Text>
          )}
          {step === 'apply' && (
            <Text style={styles.headerSubtitle}>Apply Details</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'landing' && (
          <View style={styles.landingContent}>
            {/* Dark Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroDarkAccent} />
              <View style={styles.heroGlowOverlay} />
              <Text style={styles.heroTitle}>Get the Best Home Loan Rates</Text>
              <Text style={styles.heroSub}>Starting from 8.35% p.a.</Text>
            </View>

            {/* Check Eligibility Card */}
            <TouchableOpacity
              onPress={() => setStep('basic')}
              style={styles.actionCard}
              activeOpacity={0.85}
            >
              <View style={styles.blueIconContainer}>
                <TrendingUp size={20} color="#2563EB" strokeWidth={2.2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Check Eligibility</Text>
                <Text style={styles.actionSubtitle}>2-min assessment</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            {/* Compare Lenders Card */}
            <TouchableOpacity
              onPress={() => setStep('lenders')}
              style={styles.actionCard}
              activeOpacity={0.85}
            >
              <View style={styles.purpleIconContainer}>
                <Building2 size={20} color="#7C3AED" strokeWidth={2.2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Compare Lenders</Text>
                <Text style={styles.actionSubtitle}>10+ banks & NBFCs</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            {/* Quick EMI Calculator Card */}
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorTitle}>Quick EMI Calculator</Text>

              {/* Loan Amount Slider */}
              <CustomSlider
                label="Loan Amount"
                valueText={formatIndianCurrency(loanAmount)}
                value={loanAmount}
                min={500000}
                max={20000000}
                step={50000}
                onChange={setLoanAmount}
              />

              {/* Interest Rate Slider */}
              <CustomSlider
                label="Interest Rate"
                valueText={`${interestRate.toFixed(2)}% p.a.`}
                value={interestRate}
                min={7.0}
                max={15.0}
                step={0.05}
                onChange={setInterestRate}
              />

              {/* Tenure Slider */}
              <CustomSlider
                label="Tenure"
                valueText={`${tenureYears} Years`}
                value={tenureYears}
                min={1}
                max={30}
                step={1}
                onChange={setTenureYears}
              />

              {/* Monthly EMI Result Box */}
              <View style={styles.emiResultBox}>
                <Text style={styles.emiResultLabel}>Monthly EMI</Text>
                <Text style={styles.emiResultValue}>{formatIndianCurrency(currentEmi)}</Text>
              </View>
            </View>
          </View>
        )}

        {step === 'basic' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Basic Information</Text>

            {/* Full Name Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Full Name</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="Rahul Sharma"
                placeholderTextColor="#94A3B8"
                value={form.name}
                onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              />
            </View>

            {/* Mobile Number Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Mobile Number</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm((f) => ({ ...f, phone: text }))}
              />
            </View>

            {/* Employment Type Pills */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Employment Type</Text>
              <View style={styles.optionsRow}>
                {(['Salaried', 'Self-Employed', 'Business'] as const).map((type) => {
                  const isSelected = form.employment === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chipButton,
                        isSelected && styles.chipButtonSelected,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, employment: type }))}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          isSelected && styles.chipButtonTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Monthly Income Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Monthly Income (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="80,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.income}
                onChangeText={(text) => setForm((f) => ({ ...f, income: text }))}
              />
            </View>

            {/* Existing EMIs Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Existing EMIs (₹/month)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.existingEmis}
                onChangeText={(text) => setForm((f) => ({ ...f, existingEmis: text }))}
              />
            </View>
          </View>
        )}

        {step === 'income' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Loan Requirements</Text>

            {/* Loan Amount Required Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Loan Amount Required (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="50,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.loanAmount}
                onChangeText={(text) => setForm((f) => ({ ...f, loanAmount: text }))}
              />
            </View>

            {/* Property Value Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Property Value (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="70,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.propertyValue}
                onChangeText={(text) => setForm((f) => ({ ...f, propertyValue: text }))}
              />
            </View>

            {/* Down Payment Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Down Payment (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="20,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.downPayment}
                onChangeText={(text) => setForm((f) => ({ ...f, downPayment: text }))}
              />
            </View>

            {/* Preferred Tenure Pills */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Preferred Tenure</Text>
              <View style={styles.optionsRow}>
                {(['10yr', '15yr', '20yr', '25yr', '30yr'] as const).map((tenure) => {
                  const isSelected = form.tenure === tenure;
                  return (
                    <TouchableOpacity
                      key={tenure}
                      style={[
                        styles.chipButton,
                        isSelected && styles.chipButtonSelected,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, tenure }))}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          isSelected && styles.chipButtonTextSelected,
                        ]}
                      >
                        {tenure}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {step === 'results' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Your Eligibility</Text>

            {/* Eligibility Result Card */}
            <View style={styles.resultsCard}>
              <View style={styles.resultsTopSection}>
                <Text style={styles.resultsPrimaryLabel}>Eligible Loan Amount</Text>
                <Text style={styles.resultsPrimaryValue}>₹5,070 L</Text>
              </View>

              <View style={styles.resultsColumnsRow}>
                <View style={styles.resultsCol}>
                  <Text style={styles.resultsColLabel}>Est. EMI</Text>
                  <Text style={styles.resultsColValue}>₹43,391/mo</Text>
                </View>

                <View style={styles.resultsColSeparator} />

                <View style={styles.resultsCol}>
                  <Text style={styles.resultsColLabel}>Best Rate</Text>
                  <Text style={styles.resultsColValue}>8.35% p.a.</Text>
                </View>

                <View style={styles.resultsColSeparator} />

                <View style={styles.resultsCol}>
                  <Text style={styles.resultsColLabel}>Tenure</Text>
                  <Text style={styles.resultsColValue}>20 yrs</Text>
                </View>
              </View>
            </View>

            {/* Compare Lenders Outline Button */}
            <TouchableOpacity
              style={styles.compareLendersButton}
              onPress={() => setStep('lenders')}
              activeOpacity={0.85}
            >
              <Text style={styles.compareLendersButtonText}>Compare Lenders</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'lenders' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Compare Loan Offers</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
              Comparing bank offers for {formatIndianCurrency(loanAmount)} over {tenureYears} years
            </Text>

            {comparisonHighlights && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {comparisonHighlights.lowestInterestRate && (
                  <View style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '600' }}>
                      Lowest Rate: {typeof comparisonHighlights.lowestInterestRate === 'string' ? comparisonHighlights.lowestInterestRate : comparisonHighlights.lowestInterestRate.formattedRate}
                    </Text>
                  </View>
                )}
                {comparisonHighlights.lowestMonthlyEmi && (
                  <View style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: '#1D4ED8', fontWeight: '600' }}>
                      Lowest EMI: {typeof comparisonHighlights.lowestMonthlyEmi === 'string' ? comparisonHighlights.lowestMonthlyEmi : comparisonHighlights.lowestMonthlyEmi.formattedEmi}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {offersLoading ? (
              <View style={{ paddingVertical: 36, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0F172A" />
                <Text style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>Fetching verified bank rates...</Text>
              </View>
            ) : (
              <View style={styles.lendersContainer}>
                {(bankOffers.length > 0 ? bankOffers : lenders).map((l: any) => {
                  const name = l.bankName || l.name;
                  const rate = l.interestRateFormatted || l.rate;
                  const emi = l.monthlyEmiFormatted || l.emi;
                  const iconType = l.iconType || 'sbi';
                  const iconBg = l.iconBg || '#E0F2FE';
                  const iconColor = l.iconColor || '#0284C7';
                  const isSelected = selectedBankOffer?.bankName === name || form.selectedBank === name;

                  return (
                    <View key={name} style={[styles.lenderFigmaCard, isSelected && { borderColor: '#0284C7', borderWidth: 1.5 }]}>
                      {/* Top Row: Icon + Name/Badge on Left, Rate/Per Annum on Right */}
                      <View style={styles.lenderHeaderRow}>
                        <View style={styles.lenderBrandCol}>
                          <View style={[styles.lenderIconContainer, { backgroundColor: iconBg }]}>
                            {renderLenderIcon(iconType, iconColor)}
                          </View>
                          <View style={styles.lenderNameContainer}>
                            <Text style={styles.lenderBrandName}>{name}</Text>
                            {l.badge && (
                              <View style={styles.lenderBadge}>
                                <Text style={styles.lenderBadgeText}>{l.badge}</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.lenderRateCol}>
                          <Text style={styles.lenderRateText}>{rate}</Text>
                          <Text style={styles.lenderPerAnnumText}>per annum</Text>
                        </View>
                      </View>

                      {/* Processing fee & rate validity */}
                      {l.processingFee && (
                        <View style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>
                            Processing Fee: <Text style={{ color: '#0F172A', fontWeight: '500' }}>{l.processingFee}</Text>
                          </Text>
                          {l.rateValidUntil && (
                            <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                              Rate valid until: {l.rateValidUntil} • Last verified: {l.lastUpdatedDate || 'Recent'}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Bottom Row: EMI + Max Loan on Left, Apply Button on Right */}
                      <View style={styles.lenderBottomRow}>
                        <View style={styles.lenderStatsRow}>
                          <View style={styles.lenderStatBlock}>
                            <Text style={styles.lenderStatLabel}>EMI</Text>
                            <Text style={styles.lenderStatValue}>{emi}</Text>
                          </View>
                          <View style={styles.lenderStatBlock}>
                            <Text style={styles.lenderStatLabel}>Max Loan</Text>
                            <Text style={styles.lenderStatValue}>{l.maxLoan}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBankOffer(l);
                            setForm((f) => ({ ...f, selectedBank: name }));
                            setStep('apply');
                          }}
                          style={[styles.lenderApplyButton, isSelected && { backgroundColor: '#0284C7' }]}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.lenderApplyText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Non-guaranteed approval disclaimer */}
            <View style={{ marginTop: 18, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Text style={{ fontSize: 11, color: '#64748B', lineHeight: 16 }}>
                ⚠️ <Text style={{ fontWeight: '600' }}>Disclaimer:</Text> Calculations are indicative based on reducing balance method. Interest rates and loan terms are subject to borrower eligibility and respective bank/NBFC guidelines. Loan approval and sanction are not guaranteed.
              </Text>
            </View>
          </View>
        )}

        {step === 'apply' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Complete Application</Text>

            {/* Green Pre-Approved Banner */}
            <View style={styles.preApprovedBanner}>
              <Text style={styles.preApprovedBannerText}>
                ✓ You’re pre-approved based on your profile.{'\n'}Complete the application to proceed.
              </Text>
            </View>

            {/* Full Name Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Full Name</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="ex: Rahul"
                placeholderTextColor="#94A3B8"
                value={form.name}
                onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              />
            </View>

            {/* PAN Card Number Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>PAN Card Number</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="ABCDE1234F"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={form.panCard}
                onChangeText={(text) => setForm((f) => ({ ...f, panCard: text }))}
              />
            </View>

            {/* Aadhaar Number Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Aadhaar Number</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.aadhaarNumber}
                onChangeText={(text) => setForm((f) => ({ ...f, aadhaarNumber: text }))}
              />
            </View>

            {/* Property Address Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Property Address</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="Enter full address"
                placeholderTextColor="#94A3B8"
                value={form.propertyAddress}
                onChangeText={(text) => setForm((f) => ({ ...f, propertyAddress: text }))}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'landing') {
              setStep('basic');
            } else if (step === 'basic') {
              setStep('income');
            } else if (step === 'income') {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setStep('results');
              }, 600);
            } else if (step === 'results') {
              setStep('lenders');
            } else if (step === 'lenders') {
              setStep('apply');
            } else if (step === 'apply') {
              setLoading(true);
              (async () => {
                try {
                  await api.homeLoans.requestAssistance({
                    applicantName: form.name || 'Verified Applicant',
                    applicantPhone: form.phone || '+919876543210',
                    applicantEmail: 'applicant@seedhaproperties.com',
                    loanAmount: loanAmount,
                    selectedBank: form.selectedBank || selectedBankOffer?.bankName || 'SBI Home Loans',
                    employmentType: form.employment,
                    monthlyIncome: parseFloat(form.income.replace(/,/g, '')) || 85000,
                    existingEmi: parseFloat(form.existingEmis.replace(/,/g, '')) || 0,
                    propertyIdentified: true,
                  });
                } catch (err: any) {
                  console.warn('[HomeLoanScreen] Assistance API fallback:', err?.message || err);
                } finally {
                  setLoading(false);
                  setApplied(true);
                }
              })();
            } else {
              setStep('basic');
            }
          }}
          disabled={loading}
          style={styles.primaryActionButton}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryActionButtonText}>
              {step === 'landing'
                ? 'Check Eligibility'
                : step === 'apply'
                  ? 'Submit Application'
                  : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Soft light gray matching the reference canvas
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '400',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  landingContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  // Hero Dark Card
  heroCard: {
    backgroundColor: '#090A0F',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroDarkAccent: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1E2230',
    opacity: 0.6,
  },
  heroGlowOverlay: {
    position: 'absolute',
    bottom: -60,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#161924',
    opacity: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 25,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 6,
  },
  // Action Cards (Check Eligibility & Compare Lenders)
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  blueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
  // Calculator Card
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 18,
  },
  emiResultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emiResultLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emiResultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Sticky Bottom Bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    backgroundColor: 'transparent',
  },
  primaryActionButton: {
    backgroundColor: '#000000',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Shared Form Container & Input Styling (Figma Design)
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  formSectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  formFieldBlock: {
    marginBottom: 18,
  },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  fieldInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 54,
    fontSize: 15,
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipButtonSelected: {
    backgroundColor: '#000000',
  },
  chipButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  chipButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Results Details Styling (Figma Design)
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  resultsTopSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  resultsPrimaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
  },
  resultsPrimaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  resultsColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  resultsCol: {
    flex: 1,
    alignItems: 'center',
  },
  resultsColSeparator: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
  },
  resultsColLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  resultsColValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  compareLendersButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  compareLendersButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Lenders Figma Design Styling
  lendersContainer: {
    gap: 14,
  },
  lenderFigmaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  lenderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  lenderBrandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lenderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenderNameContainer: {
    marginLeft: 12,
  },
  lenderBrandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  lenderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  lenderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lenderRateCol: {
    alignItems: 'flex-end',
  },
  lenderRateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  lenderPerAnnumText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
  lenderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  lenderStatsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  lenderStatBlock: {
    justifyContent: 'center',
  },
  lenderStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  lenderStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lenderApplyButton: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingHorizontal: 22,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenderApplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Application Screen Figma Styling
  preApprovedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  preApprovedBannerText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Success Screen Figma Styling
  successScreenContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successCircleOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCircleInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successMainSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  successDetailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successDetailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  successDetailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  backHomeButtonFigma: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  backHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});